const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/user.phonenumbers.read'
  ]
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      
      const phoneResponse = await axios.get(
        'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const phoneNumber = phoneResponse.data.phoneNumbers?.[0]?.value || null;

      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          profileImage: profile.photos[0].value,
          phone: phoneNumber  
        });
      }

      return done(null, user);
    } catch (err) {
      console.error("Error in Google Strategy:", err);
      return done(err, null);
    }
  }
));

// serialize/deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});