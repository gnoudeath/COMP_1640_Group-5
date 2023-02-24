const dashboardView = (req, res) => {

  res.render("home", {
    user: req.user
  });
};

module.exports = {
  dashboardView,
};