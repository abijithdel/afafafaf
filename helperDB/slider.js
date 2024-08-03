const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sliderSchema = new Schema({
  name: { type: String ,required: true },
  ndescriptioname: { type: String ,required: true },
  path: { type: String ,required: true },
  img: { type: String ,required: true }
});

module.exports = mongoose.model('slider', sliderSchema);
