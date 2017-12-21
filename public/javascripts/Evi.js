/*从三个因素计算证据置信度
* 公式 confidence = ab^3 c^(1/2)
* arg0:证据来源[1,0.6]
* arg1:收集者对该活动的涉猎程度[1,0.8,0.6,0.4,0.2]
* arg2:收集者对证据支持能力的评估[1,0.8,0.6,0.4,0.2]
* */
const Confidence = function (source, familiarity, suppAccess) {
  var a = source === 0 ? 1 : 0.6
  var b = 1 - familiarity * 0.2
  var c = 1 - suppAccess * 0.2
  var pass = a * b * c
  var uncertain = a * Math.pow(b, 3) * Math.sqrt(c)
  pass = pass.toFixed(2)
  uncertain = pass== 1? 0 : uncertain.toFixed(2)
  var fail = (1 - pass - uncertain).toFixed(2)
  return [pass, uncertain, fail]
}

/*从证据来源因素计算证据收集成本
* 公式 工具收集： cost = 3(1-uncertain)*pass
*      人力收集： cost = e(1-uncertain)^pass
* */
const Cost = function (source, confidence) {
  var cost = 0
  var [pass, uncertain, fail] = confidence
  if (source === 'a') {
    cost = 3 * (1 - uncertain) * pass
  } else {
    cost = Math.exp(100*pass) - 1
  }
  cost = cost.toFixed(2)
  return cost
}

/*
* */
module.exports = {Confidence, Cost}