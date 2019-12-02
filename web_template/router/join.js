var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('join');
});

router.post('/',  function(req, res, next) {
    console.log(req.body.email);
    console.log(req.body.name);
    console.log(req.body.password);
  
    const handleRegister = (err, user)=>{
      // 콜백 함수
      console.log(err)
    }
  
    User.register(new User({name: req.body.name, email: req.body.email}), req.body.password, function(err) {
      if (err) {
        console.log('error while user register!', err);
        return next(err);
      }
      console.log('user registered!');
      res.redirect('/');
    });
  })
  
module.exports = router;
