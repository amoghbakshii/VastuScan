

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login'); // or wherever your login page is
}

module.exports = { isLoggedIn };