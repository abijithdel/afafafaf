const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NewSchema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String , required: true, unique: true},
  pass: { type: String , required: true},
  role: {type: String, default:'user',required: true}
});

module.exports = mongoose.model('accounts', NewSchema);
