const express = require('express');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport')
var router = express.Router();
var User = require('../model/user')

// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

router.get('/', function(req, res){
    res.render('join', {title: "join"})
});

passport.use('local-join', new LocalStrategy({ // local-signup이라는 전략을짭니다.
  usernameField: 'email', // 필드를 정해주는 것 입니다.
  passwordField: 'password',
  passReqToCallback: true  // request객체에 user의 데이터를 포함시킬지에 대한 여부를 결정
  }, function (req, email, password, done) {
    User.findOne({email: email}, async function (err, user) { // 넘겨받은 email을 통해 검색합니다.
      if (err) return done(null);
      if (user) {
        console.log("중복된 아이디입니다.")
        return done(null, false, req.flash('signupMessage', '중복된 아이디입니다.'));
      }
      
      // db에 저장
      const newUser = new User();
      newUser.email = email;
      newUser.password = newUser.generateHash(password); // generateHash을 통해 비밀번호를 hash화 합니다.

      newUser.save(function (err) { // 저장합니다.
        if (err) throw err;
        console.log("회원가입 성공")
        return done(null, newUser); // serializeUser에 값을 넘겨줍니다.
      });

      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = new FileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

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
      await contract.submitTransaction('addUser', email);
      console.log('Transaction has been submitted');
      await gateway.disconnect();
      // res.status(200).send('Transaction has been submitted');
    })


}));

router.post("/", passport.authenticate("local-join",{
    successRedirect:"/",
    failureRedirect:"/join",
    failureFlash:true
})) 
    
module.exports = router;