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

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/', function(req, res){
      res.render('join', {title: "join"})
});

passport.use('local-join', new LocalStrategy({ // local-signup이라는 strategy 생성
  usernameField: 'email', // email을 username으로 사용하겠다고 선언
  passwordField: 'password',
  passReqToCallback: true  // request객체에 user의 데이터를 포함시킬지에 대한 여부를 결정, 유저 정보를 req.user로 접근할 수 있게 됨
  }, function (req, email, password, done) {
    User.findOne({email: email}, async function (err, user) { // 데이터베이스에서 넘겨받은 email으로 해당 유저가 있는지 검색
      if (err) return done(null);
      if (user) { // DB 상에 해당 유저가 있으면 에러 메시지 출력
        console.log("중복된 아이디입니다.")
        return done(null, false, req.flash('signupMessage', '중복된 아이디입니다.'));
      }

      // 저장할 유저 객체 생성 
      const newUser = new User();
      newUser.email = email;
      // generateHash을 통해 비밀번호를 hash화
      // generateHash 함수는 model/User에 정의되어 있음
      newUser.password = newUser.generateHash(password); 

      newUser.save(function (err) { // 새 유저를 DB에 저장
        if (err) throw err;
        console.log("회원가입 성공")
        return done(null, newUser); // serializeUser에 user를 넘겨줌 
      });
      
      // 유저를 블록체인에 저장
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
    })
}));

// post 요청이 들어오면 위에서 정의한 local-join 전략을 실행해준다
router.post("/", passport.authenticate("local-join",{
    successRedirect:"/",  // 성공 혹은 실패 시 redirect되는 url
    failureRedirect:"/join",
    failureFlash: true // 실패 시 flash 메시지를 띄우는 설정
})) 
    
module.exports = router;