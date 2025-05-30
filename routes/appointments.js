const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointments');
const { isLoggedIn } = require('../config/middleware');

// GET: Show booking form
router.get('/appointment/book',isLoggedIn, (req, res) => {
  const success = req.query.success;
  res.render('appointments/form', { success });
});

// POST: Handle form submission
router.post('/appointment/book', isLoggedIn, async (req, res) => {
  try {
    const { name, phone, email, date, time, serviceType, message } = req.body;

    const appointment = new Appointment({
      name,
      phone,
      email,
      date,
      time,
      serviceType,
      message,
      user: req.user._id,
      userRefName:req.user.name
    });

    await appointment.save();
    console.log("Appointment info:", req.body);
    req.flash('success_msg', `Appointment booked successfully for Mr/Mrs ${req.body.name}, we will get back to you shortly.`);
   
    res.redirect('/appointment/book?success=1');
  } catch (err) {
    console.error('Booking failed, please try again later:', err);
    res.status(500).render('error', {
      message: 'Something broke on our end. Please try again later.',
      statusCode: 500
    });
  }
});

module.exports = router;