const express = require('express');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport')
var router = express.Router();
var User = require('../model/user')

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/', function(req, res){
    res.render('login', {title: "login"})

});

router.post('/', passport.authenticate('local-login', { failureRedirect: '/login', failureFlash: true }), function(req, res) {
    console.log("로그인 성공")
    res.redirect('/');
}); 

passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // 인증을 수행하는 인증 함수로 HTTP request를 그대로 전달할지 여부를 결정
  }, function(req, email, password, done){
    User.findOne({'email': email}, function(err, user){
      if (err) return done(err);
      if (!user) {
        console.log("존재하지 않는 아이디입니다.")
        return done(null, false, req.flash('signinMessage', '존재하지 않는 아이디입니다.'));
        }
      if (!user.validPassword(password)) {
          console.log("비밀번호가 틀렸습니다.")
          return done(null, false, req.flash('signinMessage', '비밀번호가 틀렸습니다.'));
        }
      return done(null, user); 
    });
  })); 

module.exports = router;
