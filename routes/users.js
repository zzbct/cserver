var express = require('express');
var http = require('http')
var DB = require('../db');
var Evi = require('../public/javascripts/Evi')
var Mode = require('../public/javascripts/Mode')
var Cost = require('../public/javascripts/Cost')
var Common = require('../public/javascripts/Common')

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


/*获取证据收集分析--静态信息*/
router.get('/cost/static',function (req,res) {
  var cId = req.query.cId
  var id = req.query.id
  var auth = req.query.auth
  var sql = `SELECT * FROM reviewitem WHERE ID=${cId}`
  db.query(sql,function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    let item = result[0]
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
        let obj = {
          ID: item.ID,
          CheckItem: item.CheckItem,
          threshold: item.threshold? item.threshold : '未设定',
          result: item.result? item.result : '未论证',
          total: evis.length
        }
        res.send(obj)
      })
    }).on('error', function(e) {
      console.log("Got error: " + e.message)
    })
    request.end()
  })
})

/*执行证据收集分析*/
router.get('/cost/analyse',function (req,res) {
  var cId = req.query.cId
  var id = req.query.id
  var auth = req.query.auth
  /*划定提升范围*/
  var sql1 = `SELECT * FROM reviewitem WHERE ID=${cId}`
  var sql2 = `SELECT ID,EviItem,dict,confidence FROM eviitem where RefRItem=${cId}`
  var sql3 = 'SELECT Evidence FROM eviitem where ID='
  db.query(sql1, function (err, result1) {  //1获得论证模式、阈值、论证结果
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    let item = result1[0]
    let threshold = item.threshold
    let mode = item.ModeAfter
    let rt1 = item.result
    db.query(sql2, function (err, result2) {  //2获得子目标
      if (err) {
        console.log('[SELECT ERROR] - ', err.message);
        return;
      }
      let rt2 = result2 //子目标
      let rt3 = Mode.PaintRange(mode, rt1, threshold, rt2) //提升范围划定结果
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
      var request = http.request(opt, function(resq) {
        let datas = ''
        resq.on('data',function(data){
          datas += data
        })
        resq.on('end',function(){
          datas = JSON.parse(datas)
          let rt4 = datas.ItemForm[0].eviForm //父目标的所有证据
          rt4.map( (evi) => {
            let evilist = evi.evilist[0]
            let source = evilist.eviSource.charCodeAt() - 97
            let familiarity = evilist.eviFamiliarity.charCodeAt() - 97
            let suppAccess = evilist.eviSuppAccess.charCodeAt() - 97
            evi['confidence'] = Evi.Confidence(source, familiarity, suppAccess).map(Number)
            return true
          })
          // push new data in rt3:各子目标（直接受证据论证）每提升0.01对应的最小证据收集成本矩阵
          rt3.forEach((item1) => {
            let eviSet = []
            rt4.forEach((item2) => {
              if (item1.EviItem === item2.eviItem) {
                let evilist = item2.evilist[0]
                let source = evilist.eviSource.charCodeAt() - 97
                let familiarity = evilist.eviFamiliarity.charCodeAt() - 97
                let suppAccess = evilist.eviSuppAccess.charCodeAt() - 97
                let callback = function (k,r) {
                  return Evi.CostFunc(source,familiarity,suppAccess,k,r)
                }
                eviSet.push({
                  name: item2.eviItem,
                  evilist,
                  confidence: item2.confidence,
                  initial: item2.confidence,
                  cost: callback
                })
              }
            })
            if (item1.dict.indexOf('s') === -1) {
              item1['advice'] = Cost.MatrixBaseEvi(item1.sr, item1.er, eviSet)
            }
          })

          let rt5 = []
          //rt5:求子目标（直接受目标论证）的最小证据收集成本方案
          rt3.forEach((item1) => {
            let unit = item1.dict
            cbCost(rt5, rt3, item1)
          })
          /*求顶级目标最小成本*/
          let es = []
          let tag = mode.indexOf('|')=== -1 ? 1 : -1
          let pools = tag === -1 ? mode.split('|') : mode.split('&')
          pools.forEach((pool) => {
            let i = Common.AliveInObj(rt5, 'EviItem', pool)
            let j =Common.AliveInObj(rt3, 'dict', pool)
            let pl = i === -1 ? rt3[j] : rt5[i]
            let confidence = formalConf(pl)
            let obj = {
              name: pool,
              confidence: confidence,
              virtual: pl.confidence.split(',').map(Number)[0],
              initial: confidence[0],
              cost: pl.advice
            }
            es.push(obj)
          })
          let rt6 = Cost.MatrixBaseGoal(threshold, threshold, es, tag)[0]
          let rt7 = []
          Common.deepDig(rt6, 'evi', 'advice', rt7)
          rt3 = rt3.map((item) => {
            if (item.dict.indexOf('s') === -1) {
              return item
            }
          })
          res.send({code: 200, cost: rt6.cost, dataTree: {first: rt6, matrixB: rt3, matrixS: rt5, res: rt7}})
        })
      }).on('error', function(e) {
        console.log("Got error: " + e.message)
      })
      request.end()
    })
  })
})

/*执行论证
* {mode, refItem, confidenceInfo: {dict, pass, uncertain, fail}*/
router.post('/argu/results',function (req,res) {
  var mode = req.body.mode
  var id = req.body.refItem
  var cInfo = req.body.confidenceInfo
  console.log(cInfo)
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
   Mode.HandleMode(mode, argu, id)
  /*Bayes目标符合性论证*/
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


/*方法*/

//递归计算层级论证目标 s1 = s0 | 3 ,s0 = 1 & 3
const cbCost = function (arr1, arr2, item, key = 'eviItem') {
  let unit = item.dict
  let evis = []
  if (unit.indexOf('s') !== -1 && Common.AliveInObj(arr1, key, unit) === -1) {
    let f = item.EviItem.indexOf('|')
    let flag = f === -1 ? 1 : -1
    let eviSet = []
    evis = f === -1 ? item.split('&') : item.EviItem.split('|')
    evis.forEach((item2) => {
      let i = Common.AliveInObj(arr1, key, item2)
      let j = Common.AliveInObj(arr2, 'dict', item2)
      let confidence = formalConf(arr2[j])
      let obj = {
        name: arr2[j].dict,
        confidence: confidence,
        virtual: +arr2[j].confidence.split(',')[0],
        initial: confidence[0]
      }
      if (item2.indexOf('s') !== -1 && i === -1) {
        //push new data in rt5
        obj['cost'] = cbCost(arr1, arr2, arr2[j])
        //cbCost(arr1, arr2, arr2[j], key)
      } else {
        obj['cost'] = arr2[j].advice
      }
      eviSet.push(obj)
    })
    arr1.push({
      EviItem: unit,
      confidence: formalConf(item).join(),
      sr: item.sr,
      er: item.er,
      advice: Cost.MatrixBaseGoal(item.sr, item.er, eviSet, flag)
    })
    return Cost.MatrixBaseGoal(item.sr, item.er, eviSet, flag)
  }
}

function  formalConf (x){
  let  m = x.confidence.split(',').map(Number)
  let g = Number(x.sr) - m[0]
  let q = g < m[1] ? m[1] - g : 0
  return [Number(x.sr), Number(q.toFixed(2)), Number((1 - Number(x.sr) - q).toFixed(2)) ]
}
module.exports = router;