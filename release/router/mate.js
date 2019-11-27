const express = require('express');
const app = express();
var router = express.Router();
var User = require('../model/user')

router.get('/', function (req, res) {
    User.find({}, function(err, user){
        if(req.user == undefined){
            res.render('mate',{ title: 'mate', user: user, logged: false })
        }else{
            res.render('mate',{ title: 'mate', user: user, logged: true })
        }
        // res.render('project',{ title: 'Project', project: project })

    })
});

module.exports = router;