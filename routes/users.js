var express = require('express');
var http = require('http')
var db = require('../db');
var router = express.Router();

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
  console.log(sql)
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
  var sql = `SELECT EviItem FROM eviitem where RefRItem=${id}`
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
    console.log(result)
    var item = result[0]
    var obj = {
      ID: item.ID,
      CheckItem: item.CheckItem,
      threshold: item.threshold? item.threshold : '未设定'
    }
    res.send(obj)
  })
})
module.exports = router;
