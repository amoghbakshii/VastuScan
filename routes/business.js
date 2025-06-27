const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const User = require('../models/User');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });
const { isLoggedIn } = require('../config/middleware');
const Appointments = require('../models/appointments');
const mongoose = require('mongoose'); // <-- FIX: Mongoose was not imported

// GET: Business Listing Form
router.get('/list-business', isLoggedIn, async (req, res) => {
  try {
    const existingBusiness = await Business.findOne({ createdBy: req.user._id });

    if (existingBusiness) {
      req.flash('success', 'You already have a business listing. Welcome to your dashboard!');
      return res.redirect('/business/dashboard');
    }
    res.render('business/list');
  } catch (err) {
    console.error('Error checking existing business:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('back');
  }
});

// POST: Submit New Business (FIXED AND UPDATED)
router.post('/list-business', isLoggedIn, async (req, res) => {
  try {
    // 1. Destructure all fields from the new multi-step form's req.body
    const {
      name,
      ownerName,
      contact, // Object: { phone, email }
      address, // Object: { houseNo, area, ... }
      serviceCategories,
      workType,
      yearsInBusiness,
      detailedServices,
      workingDays,
      workingHours,
      serviceAreas, 
      languagesSpoken, 
      willingToTravel,
      emergencyServices,
      startingPrice,
      priceUnit,
      freeConsultation,
      packages, // Object: { title, description, price }
      documents, // Object: { panCard, gstNumber, ... , bankDetails: { ... } }
      agreedToTerms,
      verificationConsent,
      digitalSignature
    } = req.body;

  //full address string for geocoding
    const fullAddressQuery = `${address.houseNo}, ${address.road}, ${address.area}, ${address.city}, ${address.state} ${address.pincode}`;

    const geoData = await geocodingClient.forwardGeocode({
      query: fullAddressQuery,
      limit: 1
    }).send();

    if (!geoData.body.features || geoData.body.features.length === 0) {
        console.error("Couldn't find location from the address.", fullAddressQuery);
        req.flash('error', 'Could not validate the address. Please check and try again.');
        return res.render('business/list', { formData: req.body });
    }
    const coords = geoData.body.features[0].geometry;

    // 3. Create a new Business instance with all the structured data
    const newBusiness = new Business({
      name,
      ownerName,
      contact,
      address,
      location: {
        type: 'Point',
        coordinates: coords.coordinates
      },
      serviceCategories,
      yearsInBusiness,
      detailedServices,
      workType,
      workingDays,
      workingHours,
      // Convert comma-separated strings to arrays
      serviceAreas: serviceAreas ? serviceAreas.split(',').map(s => s.trim()) : [],
      languagesSpoken: languagesSpoken ? languagesSpoken.split(',').map(s => s.trim()) : [],
      willingToTravel,
      // Handle boolean checkboxes that might be undefined if not checked
      emergencyServices: Boolean(emergencyServices),
      startingPrice,
      priceUnit,
      freeConsultation: Boolean(freeConsultation),
      // Mongoose will handle a single package object by wrapping it in an array
      packages: packages.title ? [packages] : [], 
      documents, // This includes nested bankDetails
      agreedToTerms: Boolean(agreedToTerms),
      verificationConsent: Boolean(verificationConsent),
      digitalSignature,
      createdBy: req.user._id
    });

    // 4. Save the new business listing
    await newBusiness.save();

    // 5. Update the user's role to 'business'
    await User.findByIdAndUpdate(req.user._id, { role: 'business' });
    
    req.flash('success', 'Your business has been listed successfully! Welcome to your dashboard.');
    res.redirect('/business/dashboard');

  } catch (err) {
    console.error('Error listing business:', err);
    req.flash('error', 'Failed to submit. Please check your input and try again.');
    // Pass back form data on error so user doesn't lose their input
    res.render('business/list', {
      formData: req.body
    });
  }
});


router.get('/dashboard', isLoggedIn, async (req, res) => {
  try {
    const userBusinesses = await Business.find({ createdBy: req.user._id });

    // If the user has no business, maybe redirect them to the listing page
    if (!userBusinesses || userBusinesses.length === 0) {
        req.flash('info', 'You have not listed a business yet. Please fill out the form to get started.');
        return res.redirect('/business/list-business');
    }

    const businessIds = userBusinesses.map(b => b._id);

    const appointments = await Appointments.find({ business: { $in: businessIds } })
      .populate('user') 
      .populate('business') 
      .sort({ date: 1, time: 1 });

    res.render('business/dashboard', { businesses: userBusinesses, appointments, userName: req.user.name  });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    req.flash('error', 'Failed to load dashboard.');
    res.redirect('/');
  }
});

// GET: Edit Business Form
// Note: You will need a more complex edit form to handle all the new fields.
router.get('/edit/:id', isLoggedIn, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business || !business.createdBy.equals(req.user._id)) {
      req.flash('error', 'Unauthorized to edit this listing.');
      return res.redirect('/business/dashboard');
    }

    // This 'editList.ejs' will need to be updated to show all the new fields
    res.render('business/editList', { business });
  } catch (err) {
    console.error('Error loading edit form:', err);
    req.flash('error', 'Failed to load the edit form.');
    res.redirect('/business/dashboard');
  }
});

// POST: Update Business Listing

router.post('/edit/:id', isLoggedIn, async (req, res) => {
  try {
    // IMPORTANT: This route needs to be expanded to handle all the new fields
    // from your updated business schema, similar to the POST /list-business route.
    const businessToUpdate = await Business.findById(req.params.id);
    if (!businessToUpdate || !businessToUpdate.createdBy.equals(req.user._id)) {
        req.flash('error', 'Unauthorized or listing not found.');
        return res.redirect('/business/dashboard');
    }
    
    // As a placeholder, this only updates a few fields.
    // You must expand this section with all fields from req.body.
    const { name, ownerName, contact, address /*... and so on for all other fields */ } = req.body;

    // You should also re-run geocoding if the address has changed
    const updatedData = { ...req.body }; // This is a simplification
    
    await Business.findByIdAndUpdate(req.params.id, updatedData);

    req.flash('success', 'Business listing updated successfully!');
    res.redirect('/business/dashboard');
  } catch (err) {
    console.error('Error updating business:', err);
    req.flash('error', 'Failed to update listing.');
    res.redirect('/business/dashboard');
  }
});

router.post('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const deletedBusiness = await Business.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!deletedBusiness) {
      req.flash('error', 'Not authorized or business not found.');
      return res.redirect('/business/dashboard');
    }
    
    // Also, reset user's role if they have no other businesses
    const remainingBusinesses = await Business.countDocuments({ createdBy: req.user._id });
    if (remainingBusinesses === 0) {
        await User.findByIdAndUpdate(req.user._id, { role: 'user' });
    }

    req.flash('success', 'Business listing deleted.');
    res.redirect('/business/dashboard');
  } catch (err) {
    console.error('Error deleting business:', err);
    req.flash('error', 'Failed to delete listing.');
    res.redirect('/business/dashboard');
  }
});

// POST: Update Appointment Status
router.post('/appointments/update-status/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Ensure the business owner is authorized to update this appointment
    const appointment = await Appointments.findById(id).populate('business');
    if (!appointment || !appointment.business.createdBy.equals(req.user._id)) {
        return res.status(403).json({ success: false, error: "Unauthorized" });
    }
    
    await Appointments.findByIdAndUpdate(id, { status });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

//GET ROUTE
router.get('/businesses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // FIX #2: Added Mongoose import at top of file, so this check now works
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash('error', 'Business not found.');
            return res.status(404).redirect('/explore'); // Redirect to a safe page
        }

        const business = await Business.findById(id);

        if (!business) {
            req.flash('error', 'Business not found.');
            return res.status(404).redirect('/explore');
        }

        // FIX #3: Corrected the render path from '/business/show.ejs' to 'business/show'
        res.render('customer/show', { business }); 

    } catch (error) {
        console.error("Error fetching business:", error);
        req.flash('error', 'Something went wrong.');
        res.status(500).redirect('/explore');
    }
});


module.exports = router;
