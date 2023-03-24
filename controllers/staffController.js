const Event = require('../models/Event');
const { File, Idea, Category } = require('../models/Idea');
const { Role, getDepartmentByID, getAccountsByRoleNameAndDepartmentName } = require('../models/User');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const mailer = require('../utils/mailer');
const contentMail = require('../utils/contentMail');
const timezone = 'Asia/Ho_Chi_Minh';
const dateTimeFormat = 'DD/MM/YYYY HH:mm';

const uploadFile = async (req, res, next) => {
  try {
    const idea = new Idea();
    idea.title = req.body.title
    idea.content = req.body.content
    idea.category = req.body.category
    idea.user = req.user
    idea.isAnonymous = req.body.isAnonymous || false; //Lấy giá trị isAnonymous từ request body, nếu không có giá trị thì mặc định là false
    idea.hashtags =  JSON.parse(req.body.hashtags);
    idea.save((err) => {
      if (err) { return next(err); }
    });
    const files = req.files;
    const uploadPromises = files.map(file => {
      const newFile = new File({
        name: file.originalname,
        files: file.buffer,
        user: req.user,
        ideas: idea,
      });
      return newFile.save();
    });
    const uploadedFiles = await Promise.all(uploadPromises);

    const department = await getDepartmentByID(req.user.department);
    const accounts = await getAccountsByRoleNameAndDepartmentName("QA Coordinator", department.name);

    const now = new Date();
    const currentDateTime = moment(now).tz(timezone).format(dateTimeFormat);

    accounts.forEach(element => {
      mailer.sendMail(
        element.email,                // Gửi đến email nào
        "Notification Submit Idea",   // Tên tiêu đề
        contentMail.GetContentMailAfterPostIdea(req.user.fullName, req.user.username, currentDateTime, req.body.title, req.body.content) // Nội dung trong email
      );
    });

    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.message);
  }
};


const getUploadPage = async (req, res) => {
  const check = await Event.hasTrueStatusEvent();

  if (check) {
    const user = req.user;
    const role = await Role.findById(user.role);
    const category = await Category.find();

    user.role = role;
    const title = "Upload";
    res.render('Staff/upload', {
      title: title,
      user: user,
      category: category,
    });
  }
  else {
    req.flash('error', "Unable to access the upload page at this time!");
    res.redirect('/');
  }
};

const getMyIdeasPage = async (req, res) => {
  const user = req.user
  const role = await Role.findById(user.role)
  user.role = role
  const title = 'My Ideas'


  Idea.aggregate([
    // Match ideas by user id
    {
      $match: {
        user: mongoose.Types.ObjectId(user._id)
      }
    },
    // Left join with comments collection to get comment count per idea
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "idea",
        as: "comments"
      }
    },
    // Left join with categories collection to get category name
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category"
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $lookup: {
        from: "uploads",
        localField: "_id",
        foreignField: "ideas",
        as: "uploads"
      }
    },
    // Project only required fields and category name
    {
      $project: {
        title: 1,
        content: 1,
        createdDate: 1,
        category: { $arrayElemAt: ['$category.nameCate', 0] }, // Include category name
        user: { $arrayElemAt: ['$user', 0] },
        viewedBy: 1,
        like: 1,
        dislike: 1,
        commentCount: { $size: "$comments" }, // Count number of comments
        viewCount: { $sum: { $cond: [{ $isArray: '$viewedBy' }, { $size: '$viewedBy' }, 0] } },
        uploadCount: { $size: "$uploads" } // Count number of uploads
      }
    }
  ], function (err, ideas) {
    if (err) {
      console.log(err);
      return;
    }



    Idea.aggregate([
      // Match ideas by user id
      {
        $match: {
          user: mongoose.Types.ObjectId(user._id)
        }
      },
      // Project only required fields
      {
        $project: {
          like: 1,
          dislike: 1,
          viewedBy: 1
        }
      },
      // Group by user and sum the likes, dislikes, and views
      {
        $group: {
          _id: "$user",
          totalLikes: { $sum: "$like" },
          totalDislikes: { $sum: "$dislike" },
          totalViews: { $sum: { $cond: [{ $isArray: '$viewedBy' }, { $size: '$viewedBy' }, 0] } },
          totalIdeas: { $sum: 1 }
        }
      }
    ], function (err, totals) {
      if (err) {
        console.log(err);
        return;
      }

      Idea.aggregate([
        { $match: { user: mongoose.Types.ObjectId(user._id) } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "categories", // replace with the name of your Category model
            localField: "_id",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $project: {
            _id: 0,
            category: { $arrayElemAt: ["$category", 0] },
            count: 1
          }
        }
      ], function (err, cate) {
        if (err) {
          console.log(err);
          return;
        }

        res.render('Staff/myideas', {
          title: title,
          ideas: ideas,
          user: user,
          totals: totals,
          cate: cate

        });
      })
    })
  })
}


module.exports = {
  getUploadPage,
  uploadFile,
  getMyIdeasPage
};

