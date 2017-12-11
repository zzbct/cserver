var express = require('express');
var router = express.Router();
var http = require('http');

/* put users listing. */
router.get('/', function(req,res){
  var opt={
    host:'192.168.109.140',
    port:'8080',
    method:'GET',
    path:'http://192.168.109.140:8080/sunapp/rItem/review?stage=SOI1&passed=3&cus=0',
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