var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../model/user');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '../..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

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

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('join', {title: "Join"});
});

// 회원가입 로직
router.post('/',  function(req, res, next) {
    console.log(req.body.email);
    console.log(req.body.name);
    console.log(req.body.password);
    const handleRegister = (err, user)=>{
      console.log(err)
    }

    // 블록체인에 등록
    result = cc_call('addUser', req.body.email)
    const myobj = {result: "success"}
  
    // DB에 회원등록
    User.register(new User({name: req.body.name, email: req.body.email}), req.body.password, function(err) {
      if (err) {
        console.log('error while user register!', err);
        return next(err);
      }
      console.log('회원가입 성공');
      res.redirect('/');
    });
  })
  
module.exports = router;
