require('dotenv').config();
const mongoose = require('mongoose');

const dbConfig = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

module.exports = dbConfig;