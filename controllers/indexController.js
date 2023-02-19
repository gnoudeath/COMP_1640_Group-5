const dashboardView = (req, res) => {
  const { role } = req.user;

  switch(role) {
    case 'Admin':
      res.render('admin', { user: req.user });
      break;
    case 'Staff':
      res.render('staff_index', { user: req.user });
      break;
    case 'QAC':
      res.render('qa-coordinator', { user: req.user });
      break;
    case 'QAM':
      res.render('qa-manager', { user: req.user });
      break;
    default:
      res.status(403).send('Unauthorized');
  }
};

module.exports = { dashboardView}
