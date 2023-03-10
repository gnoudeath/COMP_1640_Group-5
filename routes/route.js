const express = require('express');
const mongoose = require('mongoose')

const { loginView, loginUser } = require('../controllers/loginController');

const { protectRoute, checkRole } = require("../auth/protect");
const { logoutUser, dashboardView, } = require('../controllers/loginController');

// const staffController = require('../controllers/staffController');
const {getUploadPage,uploadFile,getMyIdeasPage} = require('../controllers/staffController');
// const qaManagerController = require('../controllers/adminController');

const {
  formAccountView, submitFormAccount, listAccountsView, updateAccountView, updateFormAccount, deleteFormAccount,
  formDepartmentView, submitFormDepartment, listDepartmentsView, updateDepartmentView, updateFormDepartment, deleteFormDepartment,
  formCategoryView, submitFormCategory, listCategoriesView, deleteFormCategory, updateCategoryView, updateFormCategory, formSetDateView, submitFormSetDate
} = require('../controllers/adminController');



const { Role, User } = require('../models/User');

const multer = require('multer');
const upload = multer();

const { Idea, Category, CommentModel,File } = require('../models/Idea');

// Define Routes
const router = express.Router();
router.get('/login', loginView);
router.post("/login", loginUser);

router.get("/", protectRoute, dashboardView);

router.get('/logout', logoutUser);

// Start: Route Admin site

// Section: Account
router.get('/formAccount', checkRole('Admin'), formAccountView);
router.post('/submitFormAccount', checkRole('Admin'), submitFormAccount);
router.get('/listAccounts', checkRole('Admin'), listAccountsView);
router.get('/updateAccount/:id', checkRole('Admin'), updateAccountView);
router.post('/updateFormAccount', checkRole('Admin'), updateFormAccount);
router.post('/deleteAccount/:id', checkRole('Admin'), deleteFormAccount);

// Section: Department
router.get('/formDepartment', checkRole('Admin'), formDepartmentView);
router.post('/submitFormDepartment', checkRole('Admin'), submitFormDepartment);
router.get('/listDepartments', checkRole('Admin'), listDepartmentsView);
router.get('/updateDepartment/:id', checkRole('Admin'), updateDepartmentView);
router.post('/updateFormDepartment', checkRole('Admin'), updateFormDepartment);
router.post('/deleteDepartment/:id', checkRole('Admin'), deleteFormDepartment);

// Section: Category
router.get('/formCategory', checkRole(['Admin', 'QA Manager']), formCategoryView);
router.post('/submitFormCategory', checkRole(['Admin', 'QA Manager']), submitFormCategory);
router.get('/listCategories', checkRole(['Admin', 'QA Manager']), listCategoriesView);
router.get('/updateCategory/:id', checkRole(['Admin', 'QA Manager']), updateCategoryView);
router.post('/updateFormCategory', checkRole(['Admin', 'QA Manager']), updateFormCategory);
router.post('/deleteCategory/:id', checkRole(['Admin', 'QA Manager']), deleteFormCategory);

// Section: Set Date
router.get('/formSetDate', checkRole('Admin'), formSetDateView);
router.post('/submitFormSetDate', checkRole('Admin'), submitFormSetDate);
// End: Route Admin site



// ------ STAFF -----------
router.get('/myideas',getMyIdeasPage )
router.get('/upload', checkRole('Staff'),getUploadPage );
router.post('/upload', upload.array('files'),uploadFile );
// ------ STAFF END --------------


router.get('/detailIdeas/:id', async (req, res) => {
  const user = req.user
  const role = await Role.findById(user.role);
  user.role = role;
  const files = await File.find({ ideas: req.params.id });
  const idea = await Idea
    .findById(req.params.id)
    .populate('user','username')
    .populate('category','nameCate')

  if (!idea.viewedBy.includes(req.user._id)) {
      // User hasn't viewed the idea before, so update the viewedBy array and increment the view count
      idea.viewedBy.push(req.user._id);
      await idea.save();
    }
  

    
  const title = 'Detail';
  const comments = await CommentModel.find({
    idea: req.params.id
  }).populate('user','username');
  res.render('detailIdeas', { title, idea, comments,user,files })
})

router.post('/likeIdeas/:id', async (req, res) => {
  // save data to db 
  let idea = await Idea
    .findById(req.params.id);
  if (idea.like) {
    idea.like = idea.like + 1
  } else {
    idea.like = 1
  }
  idea = await Idea.findOneAndUpdate({ _id: req.params.id }, {
    like: idea.like
  })
  res.json({
    message: "success",
    data: idea
  })
})


router.post('/disLikeIdeas/:id', async (req, res) => {
  // save data to db 
  let idea = await Idea
    .findById(req.params.id);
  if (idea.dislike) {
    idea.dislike = idea.dislike + 1
  } else {
    idea.dislike = 1
  }
  idea = await Idea.findOneAndUpdate({ _id: req.params.id }, {
    dislike: idea.dislike
  })
  res.json({
    message: "success",
    data: idea
  })
})


router.post("/comment/:id", async (req, res) => {
  console.log(req.query)
  const { comment } = req.query;
  const cmt = await CommentModel.create({
    idea: req.params.id,
    comment: comment,
    user: req.user._id

  });
  
  const populateComment = await CommentModel.findById(cmt._id).populate('user','username')
  console.log(populateComment)
  res.json({
    message: "success",
    data:populateComment,
    
  })
})



router.get('/save', async function (req, res, next) {
  // Create role Admin if not exists
  await Role.findOneAndUpdate(
    { name: 'Admin' },  // Query to find existing document
    { name: 'Admin' },          // Data to update or insert new document
    { upsert: true },     // Upsert option set to true to create if does not exist
  );

  // Create Role Quality Assurance Manager if not exists
  await Role.findOneAndUpdate(
    { name: 'QA Manager' },  // Query to find existing document
    { name: 'QA Manager' },          // Data to update or insert new document
    { upsert: true },     // Upsert option set to true to create if does not exist
  );

  // Create Role Quality Assurance Coordinator if not exists
  await Role.findOneAndUpdate(
    { name: 'QA Coordinator' },  // Query to find existing document
    { name: 'QA Coordinator' },          // Data to update or insert new document
    { upsert: true },     // Upsert option set to true to create if does not exist
  );

  // Create Role Staff if not exists
  await Role.findOneAndUpdate(
    { name: 'Staff' },  // Query to find existing document
    { name: 'Staff' },          // Data to update or insert new document
    { upsert: true },     // Upsert option set to true to create if does not exist
  );

  await Role.findOneAndUpdate(
    { name: 'Staff' },  // Query to find existing document
    { name: 'Staff' },          // Data to update or insert new document
    { upsert: true },     // Upsert option set to true to create if does not exist
  );
});





// ERROR PAGE
router.get('/error', (req, res) => {
  res.render("error", {
    layout: 'error',
  })
})
// END ERROR PAGE

// Index List Ideas
router.get('/:page', protectRoute, async (req, res, next) => {
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
          commentCount: { $sum: { $size: '$comments' } },
          like: {$first: '$like'},
            dislike: {$first: '$dislike'},
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
          viewCount:1,
          like:1,
            dislike:1,
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
          const role = await Role.findById(user.role);
          user.role = role;
            res.render('home', {
              user,
              ideas,
              current: page,
              pages: Math.ceil(count / perPage),
              title
            });
          
          
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

})

router.get('/last-ideas/:page', protectRoute, async (req, res, next) => {
  try {
    const title = 'Home';
    const user = req.user;
    let perPage = 6;
    let page = req.params.page || 1;
    const filter = 'last-ideas'
  
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
          like: {$first: '$like'},
            dislike: {$first: '$dislike'},
          createdDate: {$first : '$createdDate'},
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
          viewCount:1
        }
      },
      // sort by descending comment count
      {
        $sort: {
          createdDate: -1
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
          const role = await Role.findById(user.role);
          user.role = role;
            res.render('home', {
              user,
              ideas,
              current: page,
              pages: Math.ceil(count / perPage),
              title,
              filter:filter
            });
          
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

})

router.get('/most-viewed/:page', protectRoute, async (req, res, next) => {
  try {
    const title = 'Home';
    const user = req.user;
    let perPage = 6;
    let page = req.params.page || 1;
    const filter = 'most-viewed'
  
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
          like: {$first: '$like'},
            dislike: {$first: '$dislike'},
          createdDate: {$first : '$createdDate'},
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
          viewCount:1
        }
      },
      // sort by descending comment count
      {
        $sort: {
          viewCount: -1
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
          const role = await Role.findById(user.role);
          user.role = role;
          // Login: Admin
            res.render('home', {
              user,
              ideas,
              current: page,
              pages: Math.ceil(count / perPage),
              title,
              filter:filter
            });
          
        }
      });
    })
  }
 catch (error) {
  console.error(error);
  res.redirect('/');
  // res.status(500).send('Internal Server Error');
}

})
router.get('/last-comments/:page', protectRoute, async (req, res, next) => {
  try {
    const title = 'Home';
    const user = req.user;
    let perPage = 6;
    let page = req.params.page || 1;
    const filter = 'last-comments'
  
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
      // group by Idea id and include the first comment's created_at value for each Idea
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
          viewedBy: { $addToSet: '$viewedBy' },
          viewCount: { $sum: { $cond: [ { $isArray: '$viewedBy' }, { $size: '$viewedBy' }, 0 ] } },
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
          like: 1,
          dislike: 1,
          viewCount: 1,
          latestCommentDate: 1
        }
      },
      // sort by descending latestCommentDate
      {
        $sort: {
          latestCommentDate: -1
        }
      },
      {
        $skip: (perPage * page) - perPage
      },
      {
        $limit: perPage
      }
    ], (err, ideas) => {
      if (err) {
        return;
      }
      
  
      Idea.countDocuments(async (err, count) => { // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        if (user.role) {
          const role = await Role.findById(user.role);
          user.role = role;
          // Login: Admin
            res.render('home', {
              user,
              ideas,
              current: page,
              pages: Math.ceil(count / perPage),
              title,
              filter:filter
            });
          
        }
      });
    })
  }
 catch (error) {
  console.error(error);
  res.redirect('/');
  // res.status(500).send('Internal Server Error');
}

})



// End Index List Ideas


module.exports = router;