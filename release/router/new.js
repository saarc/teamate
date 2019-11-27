const express = require('express');
const app = express();
var router = express.Router();
var Project = require('../model/project')

router.get('/', function(req,res){
    if(req.user == undefined){
        res.render('new', {title: 'new', logged: false })
    }else{
        res.render('new', {title: 'new', logged: true })
    }
})

module.exports = router;