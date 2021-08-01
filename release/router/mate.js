const express = require('express');
var router = express.Router();
var User = require('../model/user')

router.get('/',  (req, res) => {    
    User.find({}, function(err, users){
        res.render('mate', {users: users});
    })
});

module.exports = router;
