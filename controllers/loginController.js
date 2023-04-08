const passport = require("passport");
const { User, Department, Role } = require("../models/User");
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



// End: GET: Home Page
const homeView = async (req, res) => {

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
    const hashtags = req.query.hashtags ? req.query.hashtags.split(',') : [];
    const queryParams = req.query;

    




    let sortOptions;
    if (sortBy === 'all-ideas') {
      sortOptions = { commentCount: -1, createdDate: -1 };
    } else if (sortBy === 'most-viewed') {
      sortOptions = { viewCount: -1, createdDate: -1 };
    } else if (sortBy === 'last-ideas') {
      sortOptions = { createdDate: -1 };
    } else if (sortBy === 'last-comments') {
      sortOptions = { latestCommentDate: -1, createdDate: -1 };
    } else if (sortBy === 'most-popular') {
      sortOptions = { popularity: -1, createdDate: -1 };
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
      console.log(categoryName)
    }

    let departmentName = 'All Departments';
    if (department && department !== 'all') {
      const departmentId = mongoose.Types.ObjectId(department);
      const usersInDepartment = await User.find({ department: departmentId }).distinct('_id');
      const selectedDept = await Department.findById(departmentId);
      departmentName = selectedDept.name
      query.user = { $in: usersInDepartment };
    }
    if (hashtags.length > 0) {
      query.hashtags = { $in: hashtags };
    }
    

    const ideas = await Idea.aggregate([
      {
        $match: query
      },
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
          like: { $sum: { $cond: [{ $isArray: '$likedBy' }, { $size: '$likedBy' }, 0] } },
          dislike: { $sum: { $cond: [{ $isArray: '$dislikedBy' }, { $size: '$dislikedBy' }, 0] } },
          createdDate: { $first: '$createdDate' },
          commentCount: { $sum: { $size: '$comments' } },
          viewedBy: { $addToSet: '$viewedBy' },
          viewCount: { $sum: { $cond: [{ $isArray: '$viewedBy' }, { $size: '$viewedBy' }, 0] } },
          latestCommentDate: { $max: '$comments.created_at' },
          isAnonymous: { $first: '$isAnonymous' }

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
          viewCount: 1,
          latestCommentDate: 1,
          isAnonymous: 1
        }
      },
      {
        $addFields: {
          popularity: { $subtract: ['$like', '$dislike'] },
        },
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
    ]).exec();
    // console.log(ideas)

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
        department,
        queryParams,
        categories,
        hashtags,
        departmentName
        
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
  homeView,

};
