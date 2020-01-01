var express = require('express');
var router = express.Router();

var passport = require('passport');
var User = require('../model/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'hello', user: req.user });
  // console.log(req.user.userId);
});

router.post('/', function(req, res){
  var test = req.body.test;
  console.log(test);
  res.render('index', {title: test, user: req.user});
});
module.exports = router;
