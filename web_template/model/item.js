var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var autoIncrement = require('mongoose-auto-increment');

const itemSchema = new mongoose.Schema({
    itemId: {type: Number},
    name: String,
    detail: String,
    user: String,
    applies: [{
        body: {type:String, required: true},
        author: {type: String, required: true},
        // createdAt: {type:Date, default:Date.now},
        status: {type: String, default: "waiting"} // waiting, matched, rated 
    }]
});

itemSchema.plugin(autoIncrement.plugin,{
	model : 'Item',
	field : 'itemId',
	startAt : 1, //시작 
	increment : 1 // 증가
});


module.exports = mongoose.model('Item', itemSchema);