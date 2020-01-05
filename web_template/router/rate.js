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
    Item.findOne({ itemId: req.params.id }, (err, item)=>{
        if(err) return console.log(err);
        res.render('rate', {title: "rate", item: item, user: req.user})
    })
});

module.exports = router;