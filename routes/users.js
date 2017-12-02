var express = require('express');
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
  var sql = `SELECT CheckItem FROM reviewitem where Stage='${req.query.stage}' and Customize=${req.query.character}`
  db.query(sql,function (err, result) {
    if(err){
      console.log('[SELECT ERROR] - ',err.message);
      return;
    }
    //把搜索值输出
    res.send(result);
  });
})

router.get('/subgoals',function (req,res) {
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
module.exports = router;
