const passport = require("passport");
const User = require("../models/User");
const { Idea, Category } = require('../models/Idea');

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
    let perPage = 6;
    let page = req.params.page || 1;

    Idea
      .find()
      .populate('user', 'username')
      .populate('category', 'name') // find tất cả các data
      .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
      .limit(perPage)
      .exec((err, ideas) => {
        Idea.countDocuments(async (err, count) => { // đếm để tính có bao nhiêu trang
          if (err) return next(err);
          if (user.role) {
            const role = await User.Role.findById(user.role);
            user.role = role;
            // Login: Admin
            if (role.name === "Admin") {
              res.render('Admin/home', {
                user, ideas, // sản phẩm trên một page
                current: page, // page hiện tại
                pages: Math.ceil(count / perPage), // tổng số các page
                title: title
              });
            }
            // Login: Staff
            else if (role.name === "Staff") {
              res.render('Staff/home', {
                user, ideas, // sản phẩm trên một page
                current: page, // page hiện tại
                pages: Math.ceil(count / perPage), // tổng số các page
                title: title
              });
            }
            // Login: QA Manager
            else if (role.name === "QA Manager") {
              res.render('QA_Manager/home', {
                user, ideas, // sản phẩm trên một page
                current: page, // page hiện tại
                pages: Math.ceil(count / perPage), // tổng số các page
                title: title
              });
            }
            else {
              res.render('login_page');
            }
          }
          // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
        });
      });

    // If the user has a role, fetch the role data using the populate() method




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