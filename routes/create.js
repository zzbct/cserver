var express = require('express');
var http = require('http');
var router = express.Router();

/* put users listing. */
router.get('/', function(req,res){
  var opt={
    host:'192.168.109.111',
    port:'8000',
    method:'GET',
    path:'http://192.168.109.111:8000/sunapp/rItem/review?stage=SOI1&passed=3&cus=0',
    headers:{
      ID: 2,
      Auth: 'A8FKQSVM'
    }
  };
  var body = '';
  var request = http.request(opt, function(resq) {
    resq.on('data',function(d){
      body += d;
    }).on('end', function(){
      res.send(body);
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  })
  request.end();
});

module.exports = router;