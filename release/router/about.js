const express = require('express');
const app = express();
var router = express.Router();

router.get('/', function(req, res){
    if(req.user==undefined){
        res.render('about', {title: "about", logged: false})
    }else{
        res.render('about', {title: "about", logged: true})

    }
    // res.render('about', {title: "about"})
});

module.exports = router;