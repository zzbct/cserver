var Evi = require('./Evi')
var DB = require('../../db')
var Common = require('./Common')

var db = DB.comDB

/*解析论证模式*/
/*
const HandleMode = function (str, data, id) {
  let stack = [] //转换后模式
  let phase = [] //基本模式
  let tmp = [] //辅助空间
  let arr = str.split('')
  let fg = 0
  let len = arr.length
  let res = null
  for (let i = 0; i < len; i++) {
    let unit = arr[i]
    if (unit !== ')') {
      stack.push(unit)
    } else {
      tmp = []
      let item = stack.pop()
      while (item !== '(') {
        tmp.push(item)
        item = stack.pop()
      }
      tmp.reverse()
      stack.push(`s${fg}`)
      res = single(tmp.join(''),data)
      //将S0-Sn论证结果res写入eviItem
      res = res.map((item) => {return item.toFixed(2)})
      data.push({dict: `s${fg}`, confidence: res})
      let c = res.join()
      let sql1 = ''
      sql1 = `Update eviitem Set Confidence='${c}' where RefRItem = ${id} AND Dict='s${fg}'`
      db.query(sql1,function (err, result) {
        if (err){
          console.log('[SELECT ERROR] - ',err.message);
          return;
        } else{
          if (result.affectedRows == 0) {
            sql1 = `insert into eviitem(RefRItem,EviItem,Dict,Confidence) values(${id},'${phase}','s${fg}','${c}')`
            db.query(sql1, function (err, result) {
              if (err) {
                console.log('[SELECT ERROR] - ', err.message);
                return;
              }
            })
          }
        }
      })
      fg++
    }
  }
  let s = stack.join('')
  res = single(s,data)
  //将顶级目标论证结果及解析后的论证模式写入reviewItem
  let sql2 = `UPDATE reviewitem SET result=${res[0]},ModeAfter='${s}' WHERE ID = ${id}`
  db.query(sql2,function (err, result) {
    if (err){
      console.log('[SELECT ERROR] - ',err.message);
      return;
    }
  })
  return res[0]
}
*/

/*
const HandleMode = function (str, data, id) {
  var a = str.lastIndexOf('(')
  var b = str.indexOf(')')
  var idx = 0
  var res
  while (a !== -1) {
    let  tmp = `s${idx}`
    let phase = str.slice(a+1, b)
    idx++
    res = single(phase,data)
    data.push({
      dict: tmp,
      confidence: res
    })

    str = str.substring(0, a) + tmp+ str.substring(b+1)
    a = str.lastIndexOf('(')
    b = str.indexOf(')')

    //将S0-Sn论证结果res写入eviItem
    let c = res.map((item) => {return item.toFixed(2)}).join()
    let sql1 = ''
    sql1 = `Update eviitem Set Confidence='${c}' where RefRItem = ${id} AND Dict='${tmp}'`
    db.query(sql1,function (err, result) {
      if (err){
        console.log('[SELECT ERROR] - ',err.message);
        return;
      } else{
        if (result.affectedRows == 0) {
          sql1 = `insert into eviitem(RefRItem,EviItem,Dict,Confidence) values(${id},'${phase}','${tmp}','${c}')`
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
  //将顶级目标论证结果及解析后的论证模式写入reviewItem
  let sql2 = `UPDATE reviewitem SET result=${res[0]},ModeAfter='${str}' WHERE ID = ${id}`
  db.query(sql2,function (err, result) {
    if (err){
      console.log('[SELECT ERROR] - ',err.message);
      return;
    }
  })
  return res[0]
}
*/
const TransMode = function (str,id) {
  let stack = [] //转换后模式
  let phase = [] //基本模式
  let tmp = [] //辅助空间
  let arr = str.split('')
  let fg = 0
  let len = arr.length
  let res = null
  for (let i = 0; i < len; i++) {
    let unit = arr[i]
    if (unit !== ')') {
      stack.push(unit)
    } else {
      tmp = []
      let item = stack.pop()
      while (item !== '(') {
        tmp.push(item)
        item = stack.pop()
      }
      tmp.reverse()
      phase.push({
        parent: `s${fg}`,
        child: tmp.join('')
      })
      stack.push(`s${fg}`)
      let sql1 = `insert into eviitem(RefRItem,EviItem,Dict) values(${id},'${tmp.join('')}','s${fg}')`
      db.query(sql1, function (err, result) {
        if (err) {
          console.log('[SELECT ERROR] - ', err.message);
          return;
        }
      })
      fg++
    }
  }
  let s = stack.join('')
  // res = single(s,data)
  //将顶级目标论证结果及解析后的论证模式写入reviewItem
  let sql2 = `UPDATE reviewitem SET ModeAfter='${s}' WHERE ID = ${id}`
  db.query(sql2,function (err, result) {
    if (err){
      console.log('[SELECT ERROR]',err.message);
      return;
    }
  })
  return s
}
const HandleMode = function (str, data, id) {
  let stack = [] //转换后模式
  let phase = [] //基本模式
  let tmp = [] //辅助空间
  let arr = str.split('')
  let fg = 0
  let len = arr.length
  let res = null
  for (let i = 0; i < len; i++) {
    let unit = arr[i]
    if (unit !== ')') {
      stack.push(unit)
    } else {
      tmp = []
      let item = stack.pop()
      while (item !== '(') {
        tmp.push(item)
        item = stack.pop()
      }
      tmp.reverse()
      stack.push(`s${fg}`)
      res = single(tmp.join(''),data)
      //将S0-Sn论证结果res写入eviItem
      res = res.map((item) => {return item.toFixed(2)})
      data.push({dict: `s${fg}`, confidence: res})
      let c = res.join()
      let sql1 = ''
      sql1 = `Update eviitem Set Confidence='${c}' where RefRItem = ${id} AND Dict='s${fg}'`
      db.query(sql1,function (err) {
        if (err){
          console.log('[SELECT ERROR] - ',err.message);
          return;
        }
      })
      fg++
    }
  }
  let s = stack.join('')
  res = single(s,data)
  //将顶级目标论证结果及解析后的论证模式写入reviewItem
  let sql2 = `UPDATE reviewitem SET result='${res[0]}' WHERE ID = ${id}`
  db.query(sql2,function (err) {
    if (err){
      console.log('[SELECT ERROR]',err.message);
      return;
    }
  })
  return res[0]
}
const BuildTree = function (str, data) {
  let tNode = []
  let same = SplitMode(str)[0]
  same.forEach((item) => {
    if (item.indexOf('s') === -1) {
      tNode.push({
        label: item
      })
    } else {
      let pos = Common.AliveInObj(data, 'dict', item)
      if(pos !== -1) {
        let mode = data[pos].EviItem
        tNode.push({
          label: item,
          children: BuildTree(mode,data)
        })
      }
    }
  })
  return tNode.length? {label: str, children: tNode} : {label: str}
}
/*划定提升范围*/
const PaintRange = function (str, oldV, newV, data, top = newV) {
  let [same, flag] = SplitMode(str)
  let len = same.length
  let x
  let multi = 1
  let sr
  let er
  let ownV
  if (flag === -1) { //或逻辑提升规则
    x = 1 - Math.pow(1 - newV, 1/len)
    same.forEach((item) => {
      let arr  = data.filter((unit )=> {
        return unit.dict == item
      })
      ownV = arr[0].confidence.split(',')
      multi *= 1 - ownV[0]
    })
    same.forEach((item) => {
      data.forEach((unit) => {
        if (unit.dict == item) {
          ownV = unit.confidence.split(',').map(Number)
          //sr = ownV[0] < x ? x : ownV[0] + 0.01 //a
          sr  = ownV[0]
          er = 1 - (1 - top)*(1-ownV[0]) / multi
          sr = sr > er ? er : sr
          unit['sr'] = +sr.toFixed(2)
          unit['er'] = +er.toFixed(2)
          if (item.indexOf('s') !== -1) {
            data = PaintRange(unit.EviItem, ownV[0], unit.sr, data, unit.er )
          }
          return
        }
      })

    })
  } else if (flag === 1) { //与逻辑提升规则
    x = Math.pow(newV, 1/len)
    same.forEach((item) => {
      let arr  = data.filter((unit )=> {
        return unit.dict == item
      })
      ownV = arr[0].confidence.split(',')
      multi *= ownV[0]
    })

    same.forEach((item) => {
      data.forEach((unit) => {
        if (unit.dict == item) {
          ownV = unit.confidence.split(',').map(Number)
          sr = ownV[0] < newV ? newV : ownV[0]
          sr = sr > 1 ? 1 : sr
          er = top * ownV[0] / multi
          er = er > 1 ? 1 : er
          unit['sr'] = +sr.toFixed(2)
          unit['er'] = +er.toFixed(2)
          if (item.indexOf('s') !== -1) {
            data = PaintRange(unit.EviItem, ownV[0], unit.sr, data, unit.er)
          }
          return
        }
      })
    })
  }
  return data
}

var SplitMode = function (str) {
  let mode = []
  let flag = 0
  let f0 = str.indexOf('&')
  let f1 = str.indexOf('|')
  if (f0 !== -1) {
    mode = str.split('&')
    flag = 1
  } else if (f1 !== -1) {
    mode = str.split('|')
    flag = -1
  } else {
    mode.push(str)
  }
  return [mode, flag]
}

var single = function (str, data) {
  let cSet = []
  let res = null
  let [same, flag] = SplitMode(str)

  same.forEach((item) => {
    let pos = Common.AliveInObj(data, 'dict', item)
    if( pos === -1 ) {
      cSet.push([0,1,0])
    } else {
      cSet.push(data[pos].confidence)
    }
  })
  if (flag) {
    res = Evi.Bayes( cSet, flag)
  } else {
    res = cSet[0]
  }
  return res
}

module.exports = { HandleMode, TransMode, PaintRange, BuildTree }