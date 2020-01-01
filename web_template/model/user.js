var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var autoIncrement = require('mongoose-auto-increment');

const userSchema = new mongoose.Schema({
    userId: {type: Number},
    name: String,
    email: String,
    password: String
});
// 플러그인 설정
userSchema.plugin(passportLocalMongoose, { usernameField : 'email'});

userSchema.plugin(autoIncrement.plugin,{
	model : 'User',
	field : 'userId',
	startAt : 1, //시작 
	increment : 1 // 증가
});

// const model = mongoose.model('User', userSchema);

// export default model;
module.exports = mongoose.model('User', userSchema);


