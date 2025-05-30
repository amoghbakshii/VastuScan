const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const User = require('../models/User');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });
const { isLoggedIn } = require('../config/middleware');

// GET: Business Listing Form
router.get('/list-business', isLoggedIn, async (req, res) => {
  try {
    const existingBusiness = await Business.findOne({ createdBy: req.user._id });

    if (existingBusiness) {
      return res.redirect('/business/dashboard');
    }
    res.render('business/list');
  } catch (err) {
    console.error('Error checking existing business:', err);
    res.status(500).render('error', {
      message: 'Something went wrong. Please try again.',
      statusCode: 500
    });
  }
});

// POST: Submit New Business
router.post('/list-business', isLoggedIn, async (req, res) => {
  try {
    const { name, address, contact, serviceType, description } = req.body;

    const geoData = await geocodingClient.forwardGeocode({
      query: address,
      limit: 1
    }).send();

    const coords = geoData.body.features[0]?.geometry;
    if (!coords) throw new Error("Couldn't find location from the address.");

    const newBusiness = new Business({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: coords.coordinates 
      },
      contact,
      serviceType,
      description,
      createdBy: req.user._id 
    });

    await newBusiness.save();


    if (req.user.role !== 'business') {
      await User.findByIdAndUpdate(req.user._id, { role: 'business' });
    }

    res.redirect('/business/dashboard');
  } catch (err) {
    console.error('Error listing business:', err);
    res.render('business/list', {
      error: 'Failed to submit. Please check your input and try again.'
    });
  }
});


router.get('/dashboard', isLoggedIn, async (req, res) => {
  try {
    const userBusinesses = await Business.find({ createdBy: req.user._id });
    res.render('business/dashboard', { businesses: userBusinesses });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).render('error', {
      message: 'Failed to load dashboard.',
      statusCode: 500
    });
  }
});

module.exports = router;