// import mongoose from 'mongoose';
// import passportLocalMongoose from 'passport-local-mongoose';
const passportLocalMongoose = require('passport-local-mongoose');

const mongoose = require('mongoose');
// var bcrypt = require('bcrypt-nodejs'); // 암호화를 위한 모듈

const userSchema = new mongoose.Schema({
  email: {type: String, unique: true, required: true},
  name: {type: String},
  job: {type: String},
  password: {type: String, required: true}
});


userSchema.methods.comparePassword = function(inputPassword, cb) {
  if (inputPassword === this.password) {
    cb(null, true);
  } else {
    cb('error');
  }
};

userSchema.plugin(passportLocalMongoose, { usernameField : 'email'});

module.exports = mongoose.model('User', userSchema);
