var express = require('express'); //express模块
var path = require('path');//路径模块
var favicon = require('serve-favicon');//请求网页的logo
var logger = require('morgan');//在控制台中，显示req请求的信息
var cookieParser = require('cookie-parser');//解析Cookie的工具，通过req.cookie可以取到传过来的cookie,并把它们转成对象。
var bodyParser = require('body-parser');//中间件，用于处理json,raw,text和url编码的数据

//路由信息
var index = require('./routes/index');
var users = require('./routes/users');
var create = require('./routes/create');
var del = require('./routes/del');
var edit = require('./routes/edit');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); //设置视图根目录
app.set('view engine', 'jade');//设计视图模板引擎

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//载入中间件

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/*
// 访问静态资源文件 这里是访问所有dist目录下的静态资源文件
app.use(express.static(path.resolve(__dirname, '../dist')))
// 因为是单页应用 所有请求都走/dist/index.html
app.get('*', function(req, res) {
    const html = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf-8')
    res.send(html)
})
*/
//配置路由
app.use('/', index);
app.use('/users', users); //查
app.use('/create', create); //增
app.use('/del', del); //删
app.use('/edit', edit); //改

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
