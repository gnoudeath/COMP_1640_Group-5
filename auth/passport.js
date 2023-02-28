LocalStrategy = require("passport-local").Strategy;
//Load model
const User = require("../models/User");
const loginCheck = passport => {
  passport.use(
    new LocalStrategy({ usernameField: "username", passReqToCallback: true }, (req, username, password, done) => {
      //Check customer
      User.User.findOne({ username: username })
        .then((user) => {
          if (!user) {
            req.flash('error', 'Invalid username. Please try again.');
            return done(null, false);
          }
          //Match Password
          const isPasswordValid = user.password === password;
          if (isPasswordValid) {
            return done(null, user);
          } else {
            req.flash('error', 'Invalid password. Please try again.');
            return done(null, false);
          }
        })
        .catch((error) => console.log(error));
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.User.findById(id, (error, user) => {
      done(error, user);
    });
  });
};
module.exports = {
  loginCheck,
};