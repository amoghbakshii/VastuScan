const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: {
    type: String,
  },
  role: {
    type: String,
    enum: ['Customer', 'Business'],
    default: 'Customer',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);