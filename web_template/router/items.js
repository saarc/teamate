var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');
var Item = require('../model/item');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// index
router.get('/', function(req, res, next) {
    Item.find({}, function(err, item){
        res.render('items',{ title: 'item', item: item, user: req.user})
    })
});

// show
router.get('/:id', function(req, res, next){
    Item.findOne({ id: req.params.itemId }, (err, item)=>{
        if(err) return console.log(err);
        res.render('show', {item: item, user: req.user})
    })
})

// update
router.get('/update/:id', (req, res) => {
    Item.findOne({ id: req.params.itemId }, (err, item) => {
      if(err) return res.json(err);
      res.render('update', { user: req.user, item: item });
    });
});

router.post('/:id', (req, res) => {
    Item.updateOne(
    { id: req.params.itemId }, 
    { $set: { name: req.body.name, comment: req.body.comment, detail: req.body.detail } }, 
    (err, item) => {
      if(err) return res.json(err);
      console.log("수정 성공")
      res.redirect('/');
    });
});

// create
router.post('/', function(req, res, next){
    var item = new Item();
    item.name = req.body.name;
    item.comment = req.body.comment;
    item.detail = req.body.detail;
    item.user = req.user.email;
    item.save(function (err, item){
        if(err) return console.error(err);
        console.log("등록 성공");
    })
    res.redirect("/items")
})

// delete
router.get('/delete/:id', (req, res) => {
    Item.deleteOne({ id: req.params.itemId }, (err, item) => {
      if(err) return res.json(err);
      console.log("삭제 성공")
      res.redirect('/');
    });
});
  

module.exports = router;
