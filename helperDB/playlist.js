const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
  userid: { type: String, required: true },
  video: [
    {
      videoid: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model('Playlist', playlistSchema);


