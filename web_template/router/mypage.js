var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');
var Item = require('../model/item');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
    Item.find({user: req.user.email}, function(err, items){
        if(err) return res.status(500).send({error: 'db find failure'})

        // var applies = items.applies;
        // applies.forEach((apply)=>{
        //     console.log(apply.body);
        // })

        res.render('mypage', { title: 'hello', user: req.user, items: items });
    })
});

module.exports = router;
