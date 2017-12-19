var express = require('express');
var router = express.Router();

/* del users listing. */
router.get('/', function(req, res, next) {
    var [pass, uncertain, fail] = Evi.Confidence(1, 0.8, 0.6)
    console.log(pass, uncertain, fail)
});

module.exports = router;