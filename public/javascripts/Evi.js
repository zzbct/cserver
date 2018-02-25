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
  var uncertain = (1-pass)* a * Math.pow(b, 3) * Math.sqrt(c)
  pass = pass.toFixed(2)
  uncertain = pass== 1? 0 : uncertain.toFixed(2)
  var fail = (1 - pass - uncertain).toFixed(2)
  return [pass, uncertain, fail]
}

/*从证据来源因素计算证据收集成本
* 公式 工具收集： cost = 3(1-uncertain)*pass
*      人力收集： cost = e(1-uncertain)^pass
* */
const CostFunc = function (sour, fa, supp, k , r) {
  if (k == r) {
    return 0
  }
  //let con = Confidence(sour, fa, supp).map(Number)
  //let c = con[0] - con[2]
  if (sour === 0) {
    return Number((3 * (k - r)).toFixed(2))
  } else {
    return Number(Math.exp(12 * (k - r)).toFixed(2))
  }
}

/*D-S目标符合性论证*/
const DempsterShafer = function (cSet) {
  var paramLen = cSet.length
  var result = []
  if(paramLen === 0) {
    return result
  } else if(paramLen === 1) {
    return cSet[0]
  }
  var xLen = cSet[0].length
  var xArr = cSet[0].slice()
  var disK = 0

  for(var i = 0; i < xLen; i++) {
    if(i === xLen - 1) {
      for(let j = 1; j < paramLen; j++) {
        var unit = cSet[j]
        xArr[i] *= unit[i]
      }
    }
    else {
      var t1 = 1
      var t2 = 1
      for(let j = 0; j < paramLen; j++) {
        var unit = cSet[j]
        t1 = t1 * (unit[i] + unit[xLen-1])
        t2 *= unit[xLen-1]
      }
      xArr[i] = t1 - t2
    }
    disK += xArr[i]
  }
  for(var i = 0; i < xLen; i++) {
    let tmp = (xArr[i] / disK).toFixed(2)
    result.push(+tmp)
  }
  return result
}

/*Bayes目标符合性论证*/
const Bayes = function (cSet, logic) {
  var paramsLen = cSet.length;
  if(paramsLen === 0) {
    return [];
  } else if(paramsLen === 1) {
    return cSet[0];
  }
  var xArr = [1,1,1];
  if(logic === 1) { //与
    for(var i = 0; i < paramsLen; i++) {
      xArr[0] *= cSet[i][0];
      xArr[2] *= 1-cSet[i][1];
    }
    xArr[2] = xArr[2] - xArr[0];
    xArr[1] = 1 - xArr[0] - xArr[2];
  } else if(logic === -1) {
    for(var i = 0; i < paramsLen; i++) {
      xArr[0] = xArr[0]*(1-cSet[i][0]);
      xArr[1] *= cSet[i][1];
    }
    xArr[0] = 1 - xArr[0]
    xArr[2] = 1 - xArr[0] - xArr[1]
    xArr[0].toFixed(2)
    xArr[1].toFixed(2)
    xArr[2].toFixed(2)
  }
  console.log(xArr)
  return xArr.map(Number)
}

module.exports = {Confidence, CostFunc, DempsterShafer, Bayes}