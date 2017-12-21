var express = require('express');
var http = require('http')
var DB = require('../db');
var Evi = require('../public/javascripts/Evi')
var router = express.Router();

var db = DB.comDB
var argu = DB.argDB

db.connect();
var  sql = 'SELECT * FROM user'; //获取用户信息
var goalsSql = '';

/* GET users listing. */
router.get('/', function(req, res, next) {
  db.query(sql,function (err, result) {
    if(err){
      console.log('[SELECT ERROR] - ',err.message);
      return;
    }
    //把搜索值输出
    res.send(result);
  });
});

router.get('/goals',function (req,res) {
  var phase = '';
  var stage = req.query.stage;
  var character = req.query.character;
  var threshold = req.query.threshold;
  var state = req.query.state;
  var result = req.query.result;
  if (stage && stage !== 'all') {
    phase += `Stage='${stage}'`;
  }
  if (character && character !== 'all') {
    var customize = character === '标准'? 2 : 1;
    phase += (phase.length? ' and ' : '') + `Customize=${customize}`;
  }
  if (threshold && threshold !== 'all') {
    if (threshold === '未设定') {
      phase += (phase.length? ' and ' : '') + 'threshold is null';
    } else {
      phase += (phase.length? ' and ' : '') + 'threshold is not null';
    }
  }
  if (state && state !== 'all') {
    if (state === '未论证') {
      phase += (phase.length? ' and ' : '') + 'result is null';
    } else {
      phase += (phase.length? ' and ' : '') + 'result is not null';
    }
  }
  if (result && result !== 'all') {
    if (result === '未达到要求') {
      phase += (phase.length? ' and ' : '') + 'result < threshold';
    } else {
      phase += (phase.length? ' and ' : '') + 'result >= threshold';
    }
  }

  phase = phase.length? ('where '+ phase) : '';
  var sql = `SELECT * FROM reviewitem ${phase}`
  db.query(sql,function (err, result) {
    if(err){
      console.log('[SELECT ERROR] - ',err.message);
      return;
    }
    //把搜索值输出
    var set = [];
    result.forEach((item) => {
      var t;
      if(!item.threshold) {
        t = '无';
      } else if(!item.result) {
        t = '无';
      } else{
        t = item.result >= item.threshold ? `达到要求(${item.threshold})` : `未达到要求(${item.threshold})`
      }
      var obj = {
        ID: item.ID,
        CheckItem: item.CheckItem,
        Stage: item.Stage,
        Customize: item.Customize === 1 ? '自定义' : '标准',
        threshold: item.threshold? item.threshold : '未设定',
        state: item.result? item.result : '未论证',
        result: t,
        writable: false
      }
      set.push(obj)
    })
    res.send(set);
  });
})
/*获取单目标的子目标（parent）*/
router.get('/subgoals/parent',function (req,res) {
  var sql1 = `SELECT ID FROM reviewitem where CheckItem='${req.query.parent}'`
  db.query(sql1,function (err, result) {
    if(err || result.length == 0){
      console.log('[SELECT ERROR] - ',err.message);
      return;
    }
    //把搜索值输出
    var refItem = result[0].ID;
    var sql2 = `SELECT EviItem FROM eviitem where RefRItem=${refItem}`
    db.query(sql2,function (err, result) {
      if (err) {
        console.log('[SELECT ERROR] - ', err.message);
        return;
      }
      res.send(result)
    })
  });
})

/*获取单目标的子目标（cid）*/
router.get('/argu/subs',function (req,res) {
  var id = req.query.id;
  var sql = `SELECT EviItem,dict,eviID FROM eviitem where RefRItem=${id}`
  db.query(sql,function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    res.send(result)
  })
})
/*获取论证目标信息（cid）*/
router.get('/argu/goal',function (req,res) {
  var id = req.query.id;
  var sql = `SELECT * FROM reviewitem WHERE ID=${id}`
  db.query(sql,function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    var item = result[0]
    var obj = {
      ID: item.ID,
      CheckItem: item.CheckItem,
      threshold: item.threshold? item.threshold : '未设定',
      mode: item.Mode,
      result: item.result? item.result : '未论证'
    }
    res.send(obj)
  })
})

/*获取论证目标信息（cid, id, auth）*/
router.get('/argu/evis',function (req,res) {
  var cId = req.query.cId
  var id = req.query.id
  var auth = req.query.auth
  var url = `http://192.168.109.111:8080/yw/review/getItemForm?RefRItem=${cId}`
  var opt = {
    host:'192.168.109.111',
    port:'8080',
    path: url,
    method:'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'ID': id,
      'Auth': auth
    },
  }
  var factor = [['工具收集', '人力收集'], ['精通', '熟练', '较熟练', '基本了解', '其它'], ['强', '较强', '一般', '弱', '较弱']]
  var request = http.request(opt, function(resq) {
    let datas = ''
    resq.on('data',function(data){
      datas += data
    })
    resq.on('end',function(){
      datas = JSON.parse(datas)
      let evis = datas.ItemForm[0].eviForm
      //根据因素获得证据置信度
      //将因素转为中文描述
      evis.map( (evi) => {
        let evilist = evi.evilist[0]
        let source = evilist.eviSource.charCodeAt() - 97
        let familiarity = evilist.eviFamiliarity.charCodeAt() - 97
        let suppAccess = evilist.eviSuppAccess.charCodeAt() - 97
        let [pass, uncertain, fail] = Evi.Confidence(source, familiarity, suppAccess)
        evilist['pass'] = pass
        evilist['uncertain'] = uncertain
        evilist['fail'] = fail
        evilist.eviSource = factor[0][source]
        evilist.eviFamiliarity = factor[1][familiarity]
        evilist.eviSuppAccess = factor[2][suppAccess]
        evi.evilist = evilist
        return true
      })
      datas.ItemForm = datas.ItemForm[0]
      res.send(datas)
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message)
  })
  request.end()
})

/*执行论证
* {mode, refItem, confidenceInfo: {dict, pass, uncertain, fail}*/
router.post('/argu/results',function (req,res) {
  var mode = req.body.mode
  var id = req.body.refItem
  var cInfo = req.body.confidenceInfo
  var argu = [] //聚拢支持同一目标的证据信息
  var dict = [] //辅助空间
  /*聚拢支持同一目标的证据信息*/
  cInfo.forEach((item) => {
    var pos = dict.indexOf(item.dict)
    if (pos != -1) {
      let unit = argu[pos]
      unit.evidence.push([+item.pass, +item.uncertain, +item.fail])
    } else {
      dict.push(item.dict)
      argu.push({
        dict: item.dict,
        evidence: [[+item.pass, +item.uncertain, +item.fail]]
      })
    }
  })
  /*D-S目标符合性论证*/
  var sql
  argu.forEach((item) => {
    let result = Evi.DempsterShafer(item.evidence)
    item.confidence = result
    result = result.join()
    sql = `UPDATE eviitem SET Confidence='${result}' WHERE RefRItem = ${id} AND Dict = ${item.dict}`
    db.query(sql,function (err, result) {
      if (err){
        res.send({
          code: 400,
          msg: '数据库更新错误'
        })
        console.log('[SELECT ERROR] - ',err.message);
        return;
      } else {

      }
    })
  })
  /*解析论证模式*/
  /*Bayes目标符合性论证*/
  console.log(argu)
})

/*设定阈值*/
router.post('/threshold',function (req,res) {
  var sql;
  if (req.body.threshold.length) {
    sql = `UPDATE reviewitem SET threshold=${req.body.threshold} WHERE ID = ${req.body.ID}`
  } else {
    sql = `UPDATE reviewitem SET threshold=null WHERE ID = ${req.body.ID}`
  }
  db.query(sql,function (err, result) {
    if (err){
      console.log('[SELECT ERROR] - ',err.message);
      return;
    }
  })
})

module.exports = router;
