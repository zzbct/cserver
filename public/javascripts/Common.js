/*公共方法*/

//查询数组对象中是否存在属性值

const AliveInObj = function (array, key, val) {
  for( let i in array) {
    if (array[i][key] === val) {
      return i
    }
  }
  return -1
}

module.exports = {AliveInObj}