// models/Video.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoPath: { type: String, required: true }, // Use videoPath instead of video
    imgPath: { type: String, required: true }, // Use imgPath instead of thumbnail
    category: { type: String, required: true }
});

module.exports = mongoose.model('Video', videoSchema);
