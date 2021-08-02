const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs'); // 비밀번호 암호화를 위한 모듈

const userSchema = new mongoose.Schema({
  email: {type: String, unique: true, required: true},
  name: {type: String},
  job: {type: String},
  password: {type: String, required: true}
});


// hash 생성해주는 함수 
userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// 해시화된 비밀번호 값을 비교해주는 함수
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password)
};

// passport를 편리하게 사용할수 있도록 만들어놓은 모듈인
// passport-local-mongoose를 이용하겠다는 플러그인 설정
// passport는 기본적으로 username을 유저구분자로 이용하는데, 
// 우리 디비에는 username이라는 컬럼이 없으므로 email로 바꿔줌
userSchema.plugin(passportLocalMongoose, {
   usernameField : 'email'
  });
  
module.exports = mongoose.model('User', userSchema);
