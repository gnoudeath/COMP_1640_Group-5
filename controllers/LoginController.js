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
    
      Idea.aggregate([
        // perform a left join between Idea and Comment collections
        {
          $lookup: {
            from: 'comments', // the name of the Comment collection
            localField: '_id',
            foreignField: 'idea',
            as: 'comments'
          }
        },
        // group by Idea id and count the number of comments for each Idea
        {
          $group: {
            _id: '$_id',
            title: { $first: '$title' },
            content: { $first: '$content' },
            category: { $first: '$category' },
            user: { $first: '$user' },
            createdDate: {$first : '$createdDate'},
            like: {$first: '$like'},
            dislike: {$first: '$dislike'},
            commentCount: { $sum: { $size: '$comments' } },
            viewedBy: { $addToSet: '$viewedBy' },
            viewCount: { $sum: { $cond: [ { $isArray: '$viewedBy' }, { $size: '$viewedBy' }, 0 ] } }
          }
        },
        // populate user and category fields
        {
          $lookup: {
            from: 'users', // the name of the User collection
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'categories', // the name of the Category collection
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        // project only the necessary fields
        {
          $project: {
            title: 1,
            content: 1,
            user: { $arrayElemAt: ['$user.username', 0] },
            category: { $arrayElemAt: ['$category.name', 0] },
            createdDate:1,
            commentCount: 1,
            like:1,
            dislike:1,
            viewCount: 1
          }
        },
        // sort by descending comment count
        {
          $sort: {
            commentCount: -1
          }
        },
        // skip and limit based on pagination
        {
          $skip: (perPage * page) - perPage
        },
        {
          $limit: perPage
        }
      ], (err, ideas) => {
        if (err) {
          console.error(err);
          return;
        }
    
        Idea.countDocuments(async (err, count) => { // đếm để tính có bao nhiêu trang
          if (err) return next(err);
          if (user.role) {
            const role = await User.Role.findById(user.role);
            user.role = role;
            // Login: Admin
            if (role.name === "Admin") {
              res.render('Admin/home', {
                user,
                ideas,
                current: page,
                pages: Math.ceil(count / perPage),
                title
              });
            }
            // Login: Staff
            else if (role.name === "Staff") {
              res.render('Staff/home', {
                user,
                ideas,
                current: page,
                pages: Math.ceil(count / perPage),
                title
              });
            }
            // Login: QA Manager
            else if (role.name === "QA Manager") {
              res.render('QA_Manager/home', {
                user,
                ideas,
                current: page,
                pages: Math.ceil(count / perPage),
                title
              });
            }
            else {
              res.render('login_page');
            }
          }
        });
      })
    }
          // Trả về dữ liệu các sản phẩm theo định dạng nh
    



   catch (error) {
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