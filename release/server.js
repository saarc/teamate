// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// Constants
const PORT = 9000;
const HOST = '0.0.0.0';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// use static file
app.use(express.static(path.join(__dirname, 'public')));

// configure app to use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Passport
var passport = require('passport')
var session = require('express-session')
var flash = require('connect-flash');

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// DB
var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true })
var db = mongoose.connection
db.on('error', function(){
    console.log('MongoDB connection failed!')
})
db.once('open', function(){
    console.log('MongoDB connection success!')
})

// 로그인되어 있는지 확인하는 미들웨어 
app.use(function(req,res,next){

    // res.locals로 등록된 변수는 ejs 어디에서나 사용가능
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.user = req.user;
    next();
});
  
// Router
var indexRouter = require('./router/index');
var projectRouter = require('./router/project')
var newRouter = require('./router/new')
var updateRouter = require('./router/update')
var mateRouter = require('./router/mate')
var aboutRouter = require('./router/about')
var joinRouter = require('./router/join')
var loginRouter = require('./router/login')
var logoutRouter = require('./router/logout')

app.use('/', indexRouter);
app.use('/project', projectRouter);
app.use('/project/new', newRouter);
app.use('/update', updateRouter);
app.use('/about', aboutRouter);
app.use('/mate', mateRouter);
app.use('/join', joinRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter)

// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
