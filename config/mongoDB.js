const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/animdb'; // Adjust the database name if necessary

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;