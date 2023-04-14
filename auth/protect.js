
const protectRoute = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log('Please log in to continue');
  res.redirect('/login');
}
const { Role } = require('../models/User');

function checkRole(allowedRoles) {
  return async function (req, res, next) {
    try {
      // Find the user's role in the Role table by objectId
      const userRole = await Role.findById(req.user.role).lean();

      if (!userRole) {
        // User's role not found in the Role table, redirect to error page
        return res.redirect('/error');
      }

      if (!allowedRoles.includes(userRole.name)) {
        // User doesn't have the required role, redirect to error page
        return res.redirect('/error');
      }

      // User has the required role, proceed to the next middleware
      next();
    } catch (err) {
      // Handle errors
      console.error(err);
      // res.status(500).send('Internal server error');
      res.redirect('/');
    }
  }
}

module.exports = {
  protectRoute,
  checkRole,

};