const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointments');
const { isLoggedIn } = require('../config/middleware');
const Business = require('../models/Business');

// GET: Show booking form
router.get('/appointment/book', isLoggedIn, async (req, res) => {
  try {
    const success = req.query.success;
    const userId = req.user._id;

    const appointments = await Appointment.find({ user: userId })
      .populate('business')
      .sort({ date: -1 });

    const businesses = await Business.find();

    res.render('appointments/form', { businesses, success, appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).render('error', {
      message: 'Failed to load appointments. Try again later.',
      statusCode: 500
    });
  }
});


// POST: Handle form submission
router.post('/appointment/book', isLoggedIn, async (req, res) => {
  try {
    const { name, phone, email, date, time, serviceType, message ,businessId} = req.body;

    const appointment = new Appointment({
      name,
      phone,
      email,
      date,
      time,
      serviceType,
      message,
      user: req.user._id,
      userRefName:req.user.name,
      business:businessId
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

// DELETE: Delete an appointment
router.post('/appointments/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      req.flash('error_msg', 'Appointment not found.');
      return res.redirect('/appointment/book');
    }

    // Check if the logged-in user owns the appointment
    if (appointment.user.toString() !== req.user._id.toString()) {
      req.flash('error_msg', 'You are not authorized to delete this appointment.');
      return res.redirect('/appointment/book');
    }

    await Appointment.findByIdAndDelete(appointmentId);
    req.flash('success_msg', 'Appointment deleted successfully.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).render('error', {
      message: 'Failed to delete appointment. Try again later.',
      statusCode: 500
    });
  }
});


module.exports = router;