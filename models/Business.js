const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  contact: {
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  address: {
    houseNo: { type: String, required: true },
    area: { type: String, required: true },
    road: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  serviceCategories: [{ type: String, required: true }],
  serviceAreas: [{ type: String }],
  workingDays: [{ type: String }], 
  workingHours: {
    start: { type: String }, 
    end: { type: String }     
  },
  yearsInBusiness: { type: Number },

  // GOVT STUFF
  documents: {
    panCard: { type: String }, 
    gstNumber: { type: String },
    udyamNumber: { type: String },
    businessCert: { type: String },
    fssai: { type: String },
    aadhaarNo: { type: String },
    bankDetails: {
      accountHolder: { type: String },
      accountNumber: { type: String },
      ifsc: { type: String },
      upiId: { type: String }
    }
  },

  // SERVICES & PRICING
  detailedServices: [{ type: String }], 
  startingPrice: { type: Number },
  priceUnit: { type: String, enum: ['sqft', 'hour', 'consultation', 'project'] },
  freeConsultation: { type: Boolean },
  packages: [{
    title: String,
    description: String,
    price: Number
  }],

  // WORK STYLE
  workType: { type: String, enum: ['Full-Time', 'Part-Time', 'Freelancer', 'Company'] },
  willingToTravel: { type: String, enum: ['Yes', 'Within City', 'No'] },
  emergencyServices: { type: Boolean },
  languagesSpoken: [{ type: String }],

  // PLATFORM STUFF
  agreedToTerms: { type: Boolean, required: true },
  verificationConsent: { type: Boolean, required: true },
  digitalSignature: { type: String }, // could be base64 of image or signature string
  isVerified: { type: Boolean, default: false },

  // Meta
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

businessSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Business', businessSchema);
