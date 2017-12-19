/*解析论证模式*/
function divideMode(str) {
  var a = str.lastIndexOf('(')
  var b = str.indexOf(')')
  var idx = 0;
  while (a !== -1) {
    let phase = str.slice(a+1, b)
    let  tmp = `s${idx}`
    let res = 0
    idx++
    let f0 = phase.indexOf('|')
    let f1 = phase.indexOf('&')
    if (f0 != -1) {
      res = phase.split('|').reduce(function(pre,cur) {
        return Number(pre) + Number(cur)
      })
    } else if (f1 != -1) {
      res = phase.split('&').reduce(function(pre,cur) {
        return Number(pre) * Number(cur)
      })
    } else {
      res = Number(phase)
    }
    str = str.substring(0, a) + res+ str.substring(b+1)
    a = str.lastIndexOf('(')
    b = str.indexOf(')')
  }
}
