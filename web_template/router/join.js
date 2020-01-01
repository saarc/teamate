var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('join', {title: "Join"});
});

// 회원가입 로직
router.post('/',  function(req, res, next) {
    console.log(req.body.email);
    console.log(req.body.name);
    console.log(req.body.password);
  
    const handleRegister = (err, user)=>{
      // 콜백 함수
      console.log(err)
    }
  
    // mongoose register method 
    // chaincode 유저 등록 구현 필요
    User.register(new User({name: req.body.name, email: req.body.email}), req.body.password, function(err) {
      if (err) {
        console.log('error while user register!', err);
        return next(err);
      }
      console.log('회원가입 성공');
      res.redirect('/');
    });
  })
  
module.exports = router;
