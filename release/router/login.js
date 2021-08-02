const express = require('express');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport')
var router = express.Router();
var User = require('../model/user')

passport.use(new LocalStrategy(User.authenticate()));
// 유저 객체를 세션에 저장
passport.serializeUser(User.serializeUser());

// 세션에 저장된 유저 객체를 불러와주는 함수
passport.deserializeUser(User.deserializeUser());

router.get('/', function(req, res){
    res.render('login', {title: "login"})
});

// local-login이라는 strategy를 생성
passport.use('local-login', new LocalStrategy({
    usernameField: 'email',   // username으로 email을 사용하겠다고 선언
    passwordField: 'password',
    passReqToCallback: true // 인증을 수행하는 인증 함수로 HTTP request를 그대로 전달할지 여부를 결정

    // 로그인이 성공하면 done함수가 실행되고, done의 리턴값이 serializeUser함수의 인자로 들어가 세션을 저장한다 
  }, function(req, email, password, done){ 

    // 데이터베이스의 User 테이블에서 로그인하려는 email을 검색
    User.findOne({'email': email}, function(err, user){
      if (err) return done(err);
      // DB상에 해당 email을 가진 유저가 없다면 에러 로그 출력
      if (!user) {
        console.log("존재하지 않는 아이디입니다.")
        return done(null, false, req.flash('signinMessage', '존재하지 않는 아이디입니다.'));
      }
      // 비밀번호가 맞지 않다면 (validPassword 함수는 model/User.js에 정의되어 있음) 에러 로그 출력
      if (!user.validPassword(password)) {
          console.log("비밀번호가 틀렸습니다.")
          return done(null, false, req.flash('signinMessage', '비밀번호가 틀렸습니다.'));
        }
      // done 함수는 자동으로 serializeUser를 호출해준다
      return done(null, user); 
    });
  })); 

// post요청이 들어오면 local-login 전략을 실행한다.
router.post('/', passport.authenticate('local-login', 
  { failureRedirect: '/login', failureFlash: true }), function(req, res) {
  console.log("로그인 성공")
  res.redirect('/');
}); 

module.exports = router;
