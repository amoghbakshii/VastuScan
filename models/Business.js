
const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  contact: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Vastu Consultant', 'Interior Designer', 'Architect', 'Astrologer'],
    required: true
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});


businessSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Business', businessSchema);