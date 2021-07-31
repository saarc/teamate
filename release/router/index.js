const express = require('express');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport')
var router = express.Router();
var User = require('../model/user')
var Project = require('../model/project')

router.get('/', function (req, res) {
  var msg;
  var errMsg = req.flash('error');
  if(errMsg) msg = errMsg;

  Project.find({}, function(err, project){
    User.find({}, function(err, user){
      if(req.user == undefined){
        res.render('index', {title: "main", activate: "index", project: project, user: user, message : msg, logged: false} );
      }else{
        res.render('index', {title: "main", activate: "index", project: project, user: user, message : msg, user: req.user, logged: true} );
      } 
    })
  })
});

module.exports = router; 