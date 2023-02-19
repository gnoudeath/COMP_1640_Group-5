const passport = require("passport");
const User = require("../models/User");
// For View 
const loginView = (req, res) => {

    res.render("login", {
    } );
}
const loginUser = (req, res,next) => {
    const { username, password } = req.body;
    //Required
    if (!username || !password) {
      console.log("Please fill in all the fields");
      res.render("login", {
        username,
        password,
      });
    } else 
    // {
    //   passport.authenticate("local", {
    //     successRedirect: "/",
    //     failureRedirect: "/login",
    //     failureFlash: true,
    //   })(req, res);
    // }
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        const role = req.user.role;
        if (req.user.role === 'QAM') {
          res.redirect('/qamanager');
        } else if (req.user.role === 'QAC') {
          res.redirect('/qacoordinator');
        } else if (req.user.role === 'Staff') {
          res.redirect('/staff');
        } else if (req.user.role === 'Admin') {
          res.redirect('/admin');
        }
      });
    })(req, res, next);
  };
  const logoutUser = (req, res,next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  };
module.exports =  {
  logoutUser,
    loginView,
    loginUser,
};