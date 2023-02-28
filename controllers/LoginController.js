const passport = require("passport");
const User = require("../models/User");

// For View 
const loginView = (req, res) => {
  const messages = req.flash('error')
  const title = "Login";
  res.render("login_page", {
    layout: 'login_page',
    title: title,
    messages
  });
}

const loginUser = (req, res, next) => {
  const { username, password } = req.body;

  //Required
  if (!username || !password) {
    req.flash('error', "Please enter both your username and password to continue.")
    res.redirect("login");
  } else {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })(req, res);
  }
};

const logoutUser = (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
};

module.exports = {
  logoutUser,
  loginView,
  loginUser,
};