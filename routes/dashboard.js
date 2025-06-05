const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointments');
const { isLoggedIn } = require('../config/middleware');

router.get('/dashboard', isLoggedIn, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .populate('business');

    res.render('customer/dashboard', { user: req.user, appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).send('Error');
  }
});

module.exports = router;