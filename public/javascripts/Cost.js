var Evi = require('./Evi')
var DB = require('../../db')

var xarr = []
var cost = Number.MAX_VALUE

/*获得受直接证据支持的子目标提升0.01*t所花费的最小成本*/
var xarr = []
var cost = Number.MAX_VALUE

/*获得受直接证据支持的子目标提升0.01*t所花费的最小成本*/
const MatrixSingle = function (start, end, eviSet) {
  var t = 0
  var matrix = []
  for (let i = 0; i <= (end - start)*100; i++ ) {
    matrix.push([])
  }
  var result = []
  var temp = []
  var n = eviSet.length
  while ( t * 0.01 <= end - start) { //每提升 0.01的最小成本
    //每种证据组合下的成本，求最小值 E(k, i) = min (E(k, i-1), min(p(k, i)))
    //E(k, i) 由前i个可选证据下提升目标符合性到k的最小成本
    //p(k, i) 必须提升第i个证据时，前i个证据下提升目标符合性到k的最小成本
    cost = Number.MAX_VALUE
    Pcost(t*0.01+start, 0, 0, eviSet)
    matrix[t][0] = cost
    temp = xarr
    let i =  1
    while (i < n) {
      Pcost(t*0.01+start, i, 0, eviSet)
      temp = matrix[t][i-1] < cost ? temp : xarr
      matrix[t][i] = Math.min(matrix[t][i-1],cost)
      i++
    }
    result[t] = {hv: +((t*0.01+start).toFixed(2)), cost: matrix[t][n-1], num: temp.length, evi: temp}
    t++
  }
  return result
}

var Pcost = function (k, i, count, eviStatic) { //min(p(k, i))
  let eviSet = deepCopy(eviStatic)
  let data = eviSet[count]
  let c = data.confidence
  if (count < i) {
    //code
    while (c[0] < 1) {
      Pcost(k, i , count+1, eviSet)
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
          return pre + cur.cost(cur.confidence[0],cur.initial)
        }, 0)
        min = Number(min.toFixed(2))
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

function deepCopy(obj){
  var result,oClass=isClass(obj);
  //确定result的类型
  if(oClass==="Object"){
    result={};
  }else if(oClass==="Array"){
    result=[];
  }else{
    return obj;
  }
  for(key in obj){
    var copy=obj[key];
    if(isClass(copy)=="Object"){
      result[key]=arguments.callee(copy);//递归调用
    }else if(isClass(copy)=="Array"){
      result[key]=arguments.callee(copy);
    }else{
      result[key]=obj[key];
    }
  }
  return result;
}
//返回传递给他的任意对象的类
function isClass(o){
  if(o===null) return "Null";
  if(o===undefined) return "Undefined";
  return Object.prototype.toString.call(o).slice(8,-1);
}
module.exports = {MatrixSingle}