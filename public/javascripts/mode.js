var Evi = require('./Evi')
var DB = require('../../db')
var db = DB.comDB

/*解析论证模式*/
function Mode(str, data, id) {
  var a = str.lastIndexOf('(')
  var b = str.indexOf(')')
  var idx = 0
  var res
  var f0
  var f1
  var phase
  var same
  while (a !== -1) {
    let  tmp = `s${idx}`
    idx++
    res = single(str.slice(a+1, b),data)
    data.push({
      dict: tmp,
      confidence: res
    })

    str = str.substring(0, a) + tmp+ str.substring(b+1)
    a = str.lastIndexOf('(')
    b = str.indexOf(')')

    //将S0-Sn论证结果res写入eviItem
    let c = res.join()
    let sql1 = ''
    sql1 = `Update eviitem Set Confidence='${c}' where RefRItem = ${id} AND Dict='${tmp}'`
    db.query(sql1,function (err, result) {
      if (err){
        console.log('[SELECT ERROR] - ',err.message);
        return;
      } else{
        if (result.affectedRows == 0) {
          sql1 = `insert into eviitem(RefRItem,EviItem,Dict,Confidence) values(${id},'暂存','${tmp}','${c}')`
          db.query(sql1, function (err, result) {
            if (err) {
              console.log('[SELECT ERROR] - ', err.message);
              return;
            }
          })
        }
      }
    })
  }
  res = single(str,data)
  //将顶级目标论证结果写入reviewItem
  let sql2 = `UPDATE reviewitem SET result=${res[0]} WHERE ID = ${id}`
  db.query(sql2,function (err, result) {
    if (err){
      console.log('[SELECT ERROR] - ',err.message);
      return;
    }
  })
}

var single = function (str, data) {
  let cSet = []
  let res = null
  let same = []
  let flag = 0
  let f0
  let f1

  f0 = str.indexOf('|')
  f1 = str.indexOf('&')
  if (f0 != -1) {
    same = str.split('|')
    flag = -1
  } else if (f1 != -1) {
    same = str.split('&')
    flag = 1
  } else {
    same.push(str)
  }
  same.forEach((item) => {
    let arr  = data.filter((unit )=> {
      return unit.dict == item
    })
    cSet.push(arr[0].confidence)
  })
  if (flag) {
    res = Evi.Bayes( cSet, flag)
  } else {
    res = cSet[0]
  }
  return res
}
module.exports = Mode