var express = require('express');
var db = require('../db');
var router = express.Router();

db.connect();
var  sql = 'SELECT * FROM user';

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

module.exports = router;
