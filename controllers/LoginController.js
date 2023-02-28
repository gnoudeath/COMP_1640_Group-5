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
// Start: GET: Home Page


const dashboardView = async (req, res) => {
  try {
      const title = 'Home';
      const user = req.user;

      // If the user has a role, fetch the role data using the populate() method
      if (user.role) {
          const role = await User.Role.findById(user.role);
          user.role = role;
          if (role.name === "Admin") res.render('Admin/home', { user, title });
          else if (role.name === "Staff") res.render('Staff/home', { user, title });
      }
      else {
          res.render('login_page');
      }


  } catch (error) {
      console.error(error);
      res.redirect('/');
      // res.status(500).send('Internal Server Error');
  }
};
// End: GET: Home Page

module.exports = {
  logoutUser,
  loginView,
  loginUser,
  dashboardView
};