const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs'); // 암호화를 위한 모듈

const userSchema = new mongoose.Schema({
  email: {type: String, unique: true, required: true},
  name: {type: String},
  job: {type: String},
  password: {type: String, required: true}
});


// hash 생성
userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// 값 비교
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password)
};

userSchema.plugin(passportLocalMongoose, {
   usernameField : 'email'
  });
  
module.exports = mongoose.model('User', userSchema);