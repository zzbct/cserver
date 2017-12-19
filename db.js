const mysql = require('mysql');
// 连接数据库 如果不自己创建 默认test数据库会自动生成

// 为这次连接绑定事件
const comDB = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'G309',
  database: 'reviewlist'
});
const argDB = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'G309',
  database: 'argulist'
});
/************** 定义模型Model **************/

module.exports = {comDB,argDB};