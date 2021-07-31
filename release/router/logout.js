var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    if(req.user){   
        console.log("logout succeed")
        req.logout();
    }else{
        console.log("logout failed; no user login")
    }
    res.redirect('/');
});

module.exports = router;
