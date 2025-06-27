const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const User = require('../models/User');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });
const { isLoggedIn } = require('../config/middleware');


router.get('/showList',isLoggedIn, async (req, res) => {
  const businesses = await Business.find();
  res.render('customer/showList', { businesses });
});




module.exports = router;