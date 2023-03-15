const passport = require("passport");
const {User,Department,Role} = require("../models/User");
const { Idea, Category } = require('../models/Idea');
const dateTimeFormat = 'DD/MM/YYYY HH:mm';
const moment = require('moment-timezone');
const timezone = 'Asia/Ho_Chi_Minh';
const mongoose = require("mongoose");

// For View 
const loginView = (req, res) => {
  const messages = req.flash('error');
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
    const messages = req.flash('error');
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
          createdDate: { $first: '$createdDate' },
          like: { $first: '$like' },
          dislike: { $first: '$dislike' },
          commentCount: { $sum: { $size: '$comments' } },
          viewedBy: { $addToSet: '$viewedBy' },
          viewCount: { $sum: { $cond: [{ $isArray: '$viewedBy' }, { $size: '$viewedBy' }, 0] } }
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
          createdDate: 1,
          commentCount: 1,
          like: 1,
          dislike: 1,
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
          const formattedList = ideas.map(item => {
            return {
                createdDate: moment(item.createdDate).tz(timezone).format(dateTimeFormat),
            };
        });
          res.render('home', {
            user,
            ideas,
            current: page,
            pages: Math.ceil(count / perPage),
            title,
            messages,
            formattedList
          });
        } else { res.redirect('/login') }
      })
    });
  }
  catch (error) {
    console.error(error);
    res.redirect('/');
    // res.status(500).send('Internal Server Error');
  }
};
// End: GET: Home Page
const dashboardView2 = async (req, res) => {

  try {
    const categories = await Category.find({});
    const departments = await Department.find({});
    const title = 'Home';
    const messages = req.flash('error');
    const user = req.user;
    let perPage = 6;
    let page = req.query.page || 1;
    const sortBy = req.query.sortBy || 'all-ideas'
    const category = req.query.category || 'all'
    const department = req.query.department || 'all'
    

    
    let sortOptions;
    if (sortBy === 'all-ideas') {
      sortOptions = { commentCount: -1,createdDate: -1 };
    } else if (sortBy === 'most-viewed') {
      sortOptions = { viewCount: -1,createdDate: -1 };
    } else if (sortBy === 'last-ideas') {
      sortOptions = { createdDate: -1};
    } else if (sortBy === 'last-comments') {
      sortOptions = { latestCommentDate: -1,createdDate: -1 };
    }
    else {
      // Default sort option
      sortOptions = { commentCount: -1 };
    }

    
    const query = {};

  // Filter by category
  let categoryName = 'All Categories';
  if (category && category !== 'all') {
    query.category = mongoose.Types.ObjectId(category);
    const selectedCategory = await Category.findById(category);
    categoryName = selectedCategory.nameCate;
  }
  
    if (department && department !== 'all') {
      query['user.department'] = mongoose.Types.ObjectId(department);
      const selectedDepartment = await Department.findById(department);
      console.log(category)
    }

    

    const ideas = await Idea.aggregate([
      
      
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
          like: { $first: '$like' },
          dislike: { $first: '$dislike' },
          createdDate: { $first: '$createdDate' },
          commentCount: { $sum: { $size: '$comments' } },
          viewedBy: { $addToSet: '$viewedBy' },
          viewCount: { $sum: { $cond: [{ $isArray: '$viewedBy' }, { $size: '$viewedBy' }, 0] } },
          latestCommentDate: { $max: '$comments.created_at' }

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
        $match: query
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
          createdDate: 1,
          commentCount: 1,
          like: 1,
          dislike: 1,
          viewCount: 1,
          latestCommentDate: 1
        }
      },
      // sort by descending comment count
      {
        $sort: 
        sortOptions
        
      },
      // skip and limit based on pagination
      {
        $skip: (perPage * page) - perPage
      },
      {
        $limit: perPage
      }
    ]).exec();;
    
    const formattedList = ideas.map(item => {
      return {
          createdDate: moment(item.createdDate).tz(timezone).format(dateTimeFormat),
      };
  });

    const count = await Idea.countDocuments(query);
    if (user.role) {
      const role = await Role.findById(user.role);
      user.role = role;
      res.render('home', {
        user,
        ideas,
        current: page,
        pages: Math.ceil(count / perPage),
        title,
        messages,
        formattedList,
        sortBy,
        category,
        categories,
        categoryName,
        departments,
        department
      });
    } else {
      res.redirect('/login');
    }
  }
  catch (error) {
    console.error(error);
    res.redirect('/');
    // res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  logoutUser,
  loginView,
  loginUser,
  dashboardView,
  dashboardView2
};