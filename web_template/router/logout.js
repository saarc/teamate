var express = require('express');
var router = express.Router();

var passport = require('passport');
var User = require('../model/user');

router.get('/', function(req, res) {
    req.logout();
    console.log("로그아웃");
    res.redirect('/');
});

module.exports = router;
