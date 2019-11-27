const express = require('express');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport')
var router = express.Router();
var User = require('../model/user')

router.get('/', function(req, res){
    res.render('join', {title: "join"})
});

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  
  // join
  passport.use('local-join', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback : true
    }, function(req, username, password, done){
      console.log('local-join callback called');
      var username = req.body.email;
      var password = req.body.password;
      User.findOne({email: username},function(err,user){
        if(err){return next(err);}
        if(user){
          req.flash("error","사용자가 이미 있습니다.");
        }
        var newUser = new User({
          email: username,
          password: password
        });
        newUser.save(done);
      });
    }));
  
  router.post("/", passport.authenticate("local-join",{
      successRedirect:"/",
      failureRedirect:"/join",
      failureFlash:true
    }))
    
module.exports = router;