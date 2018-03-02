/*公共方法*/

//查询数组对象中是否存在属性值
const AliveInObj = function (array, key, val) {
  for( let i in array) {
    if (array[i][key] == val) {
      return i
    }
  }
  return -1
}

//对象的深度拷贝
const deepCopy = function (obj){
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

//嵌套对象的深度挖掘

const deepDig = function (obj, d1, d2,  res) {
  console.log(obj)
  let unit
  if (obj.hasOwnProperty(d1)) {
    unit = obj[d1]
    unit.forEach((item) => {
      if (item.hasOwnProperty(d2)) {
        deepDig(item[d2], d1, d2 , res)
      } else {
        res.push(item)
      }
    })
  } else {
    return []
  }
}


//返回传递给他的任意对象的类
function isClass(o){
  if(o===null) return "Null";
  if(o===undefined) return "Undefined";
  return Object.prototype.toString.call(o).slice(8,-1);
}


//判断两个对象是否对等
function deepDiff (obj1, obj2) {
  var o1 = obj1 instanceof Object;
  var o2 = obj2 instanceof Object;
  if(!o1 || !o2){/*  判断不是对象  */
    return obj1 === obj2;
  }

  if(Object.keys(obj1).length !== Object.keys(obj2).length){
    return false;
  }

  for(var attr in obj1){
    var t1 = obj1[attr] instanceof Object;
    var t2 = obj2[attr] instanceof Object;
    if(t1 && t2){
      return deepDiff(obj1[attr],obj2[attr]);
    }else if(obj1[attr] !== obj2[attr]){
      return false;
    }
  }
  return true;
}

module.exports = {AliveInObj, deepCopy, deepDig, deepDiff}