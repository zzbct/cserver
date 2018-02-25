var Evi = require('./Evi')
var DB = require('../../db')
var Common = require('./Common')

var xarr = []
var cost = Number.MAX_VALUE


/*获得直接受证据支持的子目标提升0.01*t所花费的最小成本*/
const MatrixBaseEvi = function (start, end, eviSet) {
  var t = 0
  var matrix = []
  var result = []
  for (let i = 0; i <= (end - start)*100; i++ ) {
    matrix.push([])
  }
  let test = []
  eviSet.forEach((item, idx) => {
    test.push(item.confidence)
  })
  if (Evi.DempsterShafer(test)[0] >= start) {
    result[t] = {hv: +((t*0.01+start).toFixed(2)), cost: 0, num:0, evi: []}
    t++
  }
  var temp = []
  var n = eviSet.length
  while ( t * 0.01 <= end - start) { //每提升 0.01的最小成本
    //每种证据组合下的成本，求最小值 E(k, i) = min (E(k, i-1), min(p(k, i)))
    //E(k, i) 由前i个可选证据下提升目标符合性到k的最小成本
    //p(k, i) 必须提升第i个证据时，前i个证据下提升目标符合性到k的最小成本
    cost = Number.MAX_VALUE
    PcostEvi(t*0.01+start, 0, 0, eviSet)
    matrix[t][0] = cost
    temp = xarr
    let i =  1
    while (i < n) {
      PcostEvi(t*0.01+start, i, 0, eviSet)
      temp = matrix[t][i-1] < cost ? temp : xarr
      matrix[t][i] = Math.min(matrix[t][i-1],cost)
      i++
    }
    result[t] = {hv: +((t*0.01+start).toFixed(2)), cost: matrix[t][n-1], num: temp.length, evi: temp}
    t++
  }
  return result
}

var PcostEvi = function (k, i, count, eviStatic) { //min(p(k, i))
  let eviSet = Common.deepCopy(eviStatic)
  let data = eviSet[count]
  let c = data.confidence
  if (count < i) {
    //code
    while (c[0] < 1) {
      PcostEvi(k, i , count+1, eviSet)
      c = IncData.apply(this,c)
      eviSet[count].confidence = c
    }
    if (count > 0) {
      eviSet[count].confidence = eviStatic[count].confidence
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
          return pre + cur.cost(cur.confidence[0], cur.initial[0])
        }, 0)
        min = Number(min.toFixed(2))
        if (min < cost) {
          cost = min
          xarr = []
          eviSet.forEach((item,idx) => {
            if (idx <= i) {
              if (item.confidence[0] > item.initial[0]) {
                xarr.push({
                    pos: idx,
                    name: item.name,
                    info: item.evilist,
                    conf: item.confidence,
                    initial: item.initial,
                    cost: item.cost(item.confidence[0],item.initial[0])
                })
              }
            }
          })
        }
        eviSet[count].confidence = eviStatic[count].confidence
        break
      }
    }
    eviSet[count].confidence = eviStatic[count].confidence
  }
}

var IncData = function (n1, n2, n3) {
  n1 += 0.01
  n2 = n3 > 0.01 ? n2 : n2 - (0.01 - n3)
  n3 = n3 > 0.01 ? n3 - 0.01 : 0
  return [Number(n1.toFixed(2)), Number(n2.toFixed(2)), Number(n3.toFixed(2))]
}

/*获得直接受目标支持的子目标提升0.01*t所花费的最小成本*/
const MatrixBaseGoal = function (start, end, eviSet, flag) {
  var t = 0
  var matrix = []
  var len = Number((end - start).toFixed(2))
  for (let i = 0; i <= len*100; i++ ) {
    matrix.push([])
  }
  var result = []
  var temp = []
  var n = eviSet.length
  while ( t  <= len * 100) { //每提升 0.01的最小成本
    //每种证据组合下的成本，求最小值 E(k, i) = min (E(k, i-1), min(p(k, i)))
    //E(k, i) 由前i个可选证据下提升目标符合性到k的最小成本
    //p(k, i) 必须提升第i个证据时，前i个证据下提升目标符合性到k的最小成本
    cost = Number.MAX_VALUE
    PcostGoal(t*0.01+start, 0, 0, eviSet, flag)
    matrix[t][0] = cost
    temp = xarr
    let i =  1
    while (i < n) {
      PcostGoal(t*0.01+start, i, 0, eviSet, flag)
      temp = matrix[t][i-1] < cost ? temp : xarr
      matrix[t][i] = Math.min(matrix[t][i-1],cost)
      i++
    }
    result[t] = {hv: +((t*0.01+start).toFixed(2)), cost:matrix[t][n-1], num: temp.length, evi: temp}
    t++
  }
  return result
}

var PcostGoal = function (k, i, count, eviStatic, flag) { //min(p(k, i))
  let eviSet = Common.deepCopy(eviStatic)
  let data = eviSet[count]
  let c = data.confidence
  if (count < i) {
    //code
    while (c[0] < 1) {
      PcostGoal(k, i , count+1, eviSet, flag)
      c = IncData.apply(this,c)
      eviSet[count].confidence = c
    }
    if (count > 0) {
      eviSet[count].confidence = eviStatic[count].confidence
    }
  } else {
    while(c[0] < 1) {
      c = IncData.apply(this, c)
      let unit = eviSet[count]
      unit.confidence = c
      if (c - unit.initial >= unit.cost.length) {
        return Number.MAX_VALUE
        break
      }
      let con = []
      eviSet.forEach((item, idx) => {
        con.push(item.confidence)
      })
      let res = Evi.Bayes(con, flag)[0]
      if (res >= k) {
        let min = eviSet.reduce((pre, cur) => {
          let grip = Number(((cur.confidence[0] - cur.initial) * 100).toFixed(2))
          return cur.cost.length > grip ? pre + cur.cost[grip].cost : Number.MAX_VALUE
        }, 0)
        min = Number(min.toFixed(2))
        if (min < cost) {
          cost = min
          xarr = []
          eviSet.forEach((item,idx) => {
            if (idx <= i) {
              if (item.confidence[0] > item.virtual) {
                let grip = Number(((item.confidence[0] - item.initial) * 100).toFixed(2))
                xarr.push({
                    name: item.name,
                    conf: item.confidence[0],
                    initial: item.initial,
                    virtual: item.virtual,
                    advice: item.cost[grip]
                })
              }
            }
          })
        }
        eviSet[count].confidence = eviStatic[count].confidence
        break
      }
    }
    eviSet[count].confidence = eviStatic[count].confidence
  }
}

module.exports = {MatrixBaseEvi, MatrixBaseGoal}