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
    console.log("[SHOW GET]item id: " + req.params.id);
    Item.findOne({ itemId: req.params.id }, (err, item)=>{
        if(err) return console.log(err);
        res.render('show', {title: "item 조회", item: item, user: req.user})
    })
})

// update
router.get('/update/:id', (req, res) => {
    Item.findOne({ id: req.params.itemId }, (err, item) => {
      if(err) return res.json(err);
      res.render('update', { title: "update",  user: req.user, item: item });
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

    console.log(item);

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

//create an apply
router.post('/:id/applies', function(req, res, next){
    var newapply = { body: req.body.apply, author: req.body.user }
    console.log(newapply)
    Item.findOne({ itemId: req.params.id }, function(err, item){
        item.applies.push(newapply);
        item.save();
        console.log("신청 성공");
        res.redirect('/');
    })
});

// admit an apply
router.post('/:id/admit', function(req, res, next){
    var index = req.body.index;
    Item.findOne({ itemId: req.params.id }, function(err, item){
        if(err) return res.json({success:false, message:err});
        item.applies[index].$set({status: "matched"});
        item.save();
        console.log(item.applies[index].status);
        res.redirect('/')
    })
})

module.exports = router;
