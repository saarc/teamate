var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');
var Item = require('../model/item');

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '../..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


async function cc_call(fn_name, args){
    
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
  
    const userExists = await wallet.exists('user2');
    if (!userExists) {
        console.log('An identity for the user "user2" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user2', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('teamate');
  
    var result;
    
    if(fn_name == 'addUser')
        result = await contract.submitTransaction('addUser', args);
    else if( fn_name == 'addRating')
    {
        e=args[0];
        p=args[1];
        s=args[2];
        result = await contract.submitTransaction('addRating', e, p, s);
    }
    else if(fn_name == 'readRating')
        result = await contract.evaluateTransaction('readRating', args);
    else
        result = 'not supported function'
  
    return result;
  }


// rate user
router.get('/:id', function(req, res, next){
    Item.findOne({ itemId: req.params.id }, (err, item)=>{
        if(err) return console.log(err);
        var applies = item.applies;
        // console.log(applies.length);

        var participants = new Array();
        for(var i=0; i<applies.length; i++){
            if(applies[i].status == "matched"){
                participants[i] = applies[i]; 
                // console.log(participants[i].author)
            }
        }
        res.render('rate', {title: "rate", item: item, user: req.user, participants: participants});
    })
})  

router.post('/:id', function(req, res, next){
    var emails = req.body.email;
    var items = req.body.item;
    var scores = req.body.score;
    var length = req.body.length[0];

    length *= 1; // convert type string to number
    console.log(typeof length);

    for(var i=0; i<length; i++){
        var email = emails[i];
        var score = scores[i];
        var item = items[i];
        Item.findOne({ itemId: req.params.id }, function(err, item){
            if(err) return res.json({success:false, message:err});        
            item.applies.find({author: email}).$set({status: "rated"});
            item.save();
            console.log(item.applies.find({author: email}).status)
        })
        var args=[email, item, score];
        console.log(args);
        result = cc_call('addRating', args)
    }
    res.render('index', {user: req.user, title:"index"});
}) 

module.exports = router;