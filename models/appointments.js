const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Vastu Consultation', 'Interior Design', 'Follow-up', 'Site Visit', 'Other','Plumbing','House Automation'],
    required: true
  },
  message: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  userRefName: {
    type: String,
    required: true
  },
  business: {
    type: mongoose.Schema.ObjectId,
    ref: 'Business',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);