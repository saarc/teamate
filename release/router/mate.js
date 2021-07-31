const express = require('express');
var router = express.Router();
var User = require('../model/user')

// var isAuthenticated = function (req, res, next) {
//   if (req.isAuthenticated())
//     return next();
//   res.redirect('/login');
// };

router.get('/',  (req, res) => {    
    User.find({}, function(err, users){
        res.render('mate', {users: users});
    })
});

module.exports = router;
