const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const User = require('../models/User');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });
const { isLoggedIn } = require('../config/middleware');
const Appointments = require('../models/appointments');  // fixed name here

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
    // Pass back form data on error so user doesn't lose input
    res.render('business/list', {
      error: 'Failed to submit. Please check your input and try again.',
      formData: req.body
    });
  }
});

router.get('/dashboard', isLoggedIn, async (req, res) => {
  try {
    const userBusinesses = await Business.find({ createdBy: req.user._id });

    const businessIds = userBusinesses.map(b => b._id);

    // find all appointments for this business owner
    const appointments = await Appointments.find({ business: { $in: businessIds } })
      .populate('user') 
      .populate('business') 
      .sort({ date: 1, time: 1 });

    res.render('business/dashboard', { businesses: userBusinesses, appointments, userName: req.user.name  });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).render('error', {
      message: 'Failed to load dashboard.',
      statusCode: 500
    });
  }
});

// GET: Edit Business Form
router.get('/edit/:id', isLoggedIn, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business || !business.createdBy.equals(req.user._id)) {
      return res.status(403).render('error', {
        message: 'Unauthorized to edit this listing.',
        statusCode: 403
      });
    }

    res.render('business/editList', { business });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).render('error', {
      message: 'Failed to load edit form.',
      statusCode: 500
    });
  }
});

// POST: Update Business Listing
router.post('/edit/:id', isLoggedIn, async (req, res) => {
  try {
    const { name, address, contact, serviceType, description } = req.body;

    const geoData = await geocodingClient.forwardGeocode({
      query: address,
      limit: 1
    }).send();

    const coords = geoData.body.features[0]?.geometry;
    if (!coords) throw new Error("Couldn't find location from the address.");

    const updatedBusiness = await Business.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      {
        name,
        address,
        location: {
          type: 'Point',
          coordinates: coords.coordinates
        },
        contact,
        serviceType,
        description
      },
      { new: true }
    );

    if (!updatedBusiness) {
      return res.status(403).render('error', {
        message: 'Unauthorized or listing not found.',
        statusCode: 403
      });
    }

    res.redirect('/business/dashboard');
  } catch (err) {
    console.error('Error updating business:', err);
    res.status(500).render('error', {
      message: 'Failed to update listing.',
      statusCode: 500
    });
  }
});

router.post('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const deletedBusiness = await Business.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!deletedBusiness) {
      return res.status(403).render('error', {
        message: 'Not authorized or business not found.',
        statusCode: 403
      });
    }

    res.redirect('/business/dashboard');
  } catch (err) {
    console.error('Error deleting business:', err);
    res.status(500).render('error', {
      message: 'Failed to delete listing.',
      statusCode: 500
    });
  }
});

// POST: Update Appointment Status
router.post('/appointments/update-status/:id', isLoggedIn, async (req, res) => {
  console.log('Update status called');
  console.log('Params:', req.params);
  console.log('Body:', req.body);

  const { id } = req.params;
  const { status } = req.body;

  try {
    await Appointments.findByIdAndUpdate(id, { status });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;