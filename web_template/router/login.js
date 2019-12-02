var express = require('express');
var router = express.Router();

var passport = require('passport');
var User = require('../model/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/', function(req, res) {
    res.render('login', {title: "login", user: req.user, message: req.flash('error')});
});

router.post('/', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function(req, res) {
    console.log("로그인")
    res.redirect('/');
});
  
module.exports = router;
