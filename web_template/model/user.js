var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    name : String,
    email: String,
    password: String
});
// 플러그인 설정
userSchema.plugin(passportLocalMongoose, { usernameField : 'email'});

// const model = mongoose.model('User', userSchema);

// export default model;
module.exports = mongoose.model('User', userSchema);


