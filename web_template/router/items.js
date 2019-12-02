var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');
var Item = require('../model/item');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/', function(req, res, next) {
    Item.find({}, function(err, item){
        res.render('items',{ title: 'item', item: item, user: req.user})
    })
});


// FIXME
// router.get('/:itemId', function(req, res, next){
//     console.log(req.params.itemId)
//     Item.findOne({itemId: req.params.itemId}, (err, item)=>{
//         if(err) return console.log(err);
//         res.render('show', {item: item, user: req.user})
//     })
// })

router.post('/', function(req, res, next){
    var item = new Item();
    item.name = req.body.name;
    item.comment = req.body.comment;
    item.detail = req.body.detail;
    item.save(function (err, item){
        if(err) return console.error(err);
        console.log(item.name + "이 성공적으로 등록되었습니다.");
    })
    res.redirect("/items")
})

module.exports = router;
