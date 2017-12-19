var express = require('express');
var http = require('http');
var encoding = require('encoding');

var router = express.Router();

/* GET login page. */
router.post('/', function(req,res){
  var opt={
    host:'192.168.109.111',
    port:'8080',
    method:'POST',
    path:'http://192.168.109.111:8080/sunapp/login',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  };
  var content = {
    UserName: req.body.user,
    Password: req.body.password
  }
  var request = http.request(opt, function(resq) {
    resq.on('data',function(data){
      res.send(data);
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  })
  request.write(JSON.stringify(content));
  request.end();
});

module.exports = router;
