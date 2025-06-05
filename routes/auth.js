const express = require('express');
const router = express.Router();
const passport = require('passport');


router.get('/login', async (req, res) => {
  try {
    let appointments = [];

    if (req.user) {
      appointments = await userAppointments.find({ userId: req.user._id });
    }

    res.render('auth/login', {
      user: req.user,
      appointments
    });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.render('auth/login', {
      user: req.user,
      appointments: []
    });
  }
});

// Google Auth
router.get('/google',
  passport.authenticate('google', {
    scope: [
      'profile',
      'email'
    ]
  })
);

// Google Auth Callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res) => {
    console.log("User info:", req.user);
    req.flash('success_msg', `Welcome ${req.user.name}, you're now logged in.`);
    res.redirect('/dashboard');
  }
);

// Logout
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success_msg', 'You have been logged out.');
    res.redirect('/');
  });
});

module.exports = router;