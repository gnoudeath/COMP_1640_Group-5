
const protectRoute = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  console.log('Please log in to continue');
  res.redirect('/login');
}

const isAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if(req.user.role === "Admin")
    return next();
    else res.redirect('/error')
  }
  else res.redirect('/login');
}
const isManager = (req, res, next) => {
  if (req.isAuthenticated()) {
    if(req.user.role === "QA Manager")
    return next();
    else res.redirect('/error')
  }
  else res.redirect('/login');
}
const isCoordinator = (req, res, next) => {
  if (req.isAuthenticated()) {
    if(req.user.role === "QA Coordinator")
    return next();
    else res.redirect('/error')
  }
  else res.redirect('/login');
}
const isStaff = (req, res, next) => {
  if (req.isAuthenticated()) {
    if(req.user.role === "Staff")
    return next();
    else res.redirect('/error')
  }
  else res.redirect('/login');
}




module.exports = {
  protectRoute,
  isAdmin,
  isCoordinator,
  isManager,
  isStaff
  
};