var Evi = require('./Evi')
var DB = require('../../db')

var xarr = []
var cost = Number.MAX_VALUE

/*获得受直接证据支持的子目标提升0.01*t所花费的最小成本*/
const MatrixSingle = function (confidence, start, end, eviSet) {
  var t = 0
  var matrix = []
  var result = []
  var n = eviSet.length
  var i =  1
  matrix[0][0] = Pcost(start, 0, 0, eviSet)
  while ( t * 0.01 < end - start) { //每提升 0.01的最小成本
    //每种证据组合下的成本，求最小值 E(k, i) = min (E(k, i-1), min(p(k, i)))
    //E(k, i) 由前i个可选证据下提升目标符合性到k的最小成本
    //p(k, i) 必须提升第i个证据时，前i个证据下提升目标符合性到k的最小成本
    var arr = []
    var cost = Number.MAX_VALUE
    while (i < n) {
      matrix[t][i] = Math.min(matrix[t][i-1],Pcost(t*0.01+start, i, 0, eviSet))
      i++
    }
    t++
  }
  matrix.forEach((item) => {
    result.push(item[item.length - 1])
  })
  return result
}

var Pcost = function (k, i, count, eviSet) { //min(p(k, i))
  let data = eviSet[count]
  let c = data.confidence
  let mirror = deepCopy(eviSet)
  if (count < i) {
    //code
    while (c[0] < 1) {
      Pcost(k, i , count+1, eviSet,mirror)
      c = IncData.apply(this,c)
      eviSet[count].confidence = c
    }
    if (count > 0) {
      eviSet[count].confidence = mirror[count].confidence
    }
  } else {
    while(c[0] < 1) {
      c = IncData.apply(this, c)
      eviSet[count].confidence = c
      let con = []
      eviSet.forEach((item, idx) => {
        con.push(item.confidence)
      })
      let res = Evi.DempsterShafer(con)[0]
      if (res >= k) {
        let min = eviSet.reduce((pre, cur) => {
          return pre + cur.cost(cur.confidence[0],cur.initial)
        }, 0)
        if (min < cost) {
          cost = min
          xarr = []
          eviSet.forEach((item,idx) => {
            if (idx <= i) {
              if (item.confidence[0] > item.initial) {
                xarr.push({pos: idx, conf: item.confidence[0], initial: item.initial})
              }
            }
          })
        }
        eviSet[count].confidence = mirror[count].confidence
        break
      }
    }
    eviSet[count].confidence = mirror[count].confidence
  }
}

var IncData = function (n1, n2, n3) {
  n1 += 0.01
  n2 = n3 > 0.01 ? n2 : n2 - (0.01 - n3)
  n3 = n3 > 0.01 ? n3 - 0.01 : 0
  return [Number(n1.toFixed(2)), Number(n2.toFixed(2)), Number(n3.toFixed(2))]
}

var deepCopy = function(o) {
  if (o instanceof Array) {
    var n = [];
    for (var i = 0; i < o.length; ++i) {
      n[i] = deepCopy(o[i]);
    }
    return n;

  } else if (o instanceof Object) {
    var n = {}
    for (var i in o) {
      n[i] = deepCopy(o[i]);
    }
    return n;
  } else {
    return o;
  }
} //数组深拷贝

module.exports = MatrixSingle