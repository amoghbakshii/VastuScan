const express = require('express');
require('dotenv').config();
const path = require('path');
const app = express();
const ejsMate = require('ejs-mate');
const dbConfig = require('./config/db');
const userSchema = require('./models/User');
const bodyParser = require('body-parser');
const appointmentRoutes = require('./routes/appointments');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const custRoutes = require('./routes/customer');
const dashboardRoute = require('./routes/dashboard');
const session = require('express-session');
const passport = require('passport');
require('./config/passport'); 
const flash = require('connect-flash');



//view engine
app.engine('ejs', ejsMate); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// connect to DB
dbConfig(); 


// Static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash()); 

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//Middleware
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});



// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/business', businessRoutes);
app.use('/customer',custRoutes);
app.use('/', appointmentRoutes);
app.use('/', dashboardRoute);


// 404 Handler
app.use((req, res) => {
  res.status(404).render('error', {
    message: 'The page you are looking for does not exist!!',
    statusCode: 404
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Something broke on our side',
    statusCode: err.status || 500
  });
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VastuScan is running on port ${PORT}`);
});

