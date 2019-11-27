const mongoose = require('mongoose');
const projectSchema = new mongoose.Schema({
  title: {type: String, required: true},
  detail: {type: String, required: true},
  content: {type: String, required: true},
  createdAt: {type: Date, default: Date.now}
});


module.exports = mongoose.model('Project', projectSchema);

