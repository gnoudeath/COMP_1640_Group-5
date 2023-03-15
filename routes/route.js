const express = require('express');
const mongoose = require('mongoose');
const dateTimeFormat = 'DD/MM/YYYY HH:mm';
const moment = require('moment-timezone');
const timezone = 'Asia/Ho_Chi_Minh';

const { loginView, loginUser } = require('../controllers/loginController');

const { protectRoute, checkRole } = require("../auth/protect");
const { logoutUser, dashboardView, dashboardView2 } = require('../controllers/loginController');

// const staffController = require('../controllers/staffController');
const { getUploadPage, uploadFile, getMyIdeasPage } = require('../controllers/staffController');
// const qaManagerController = require('../controllers/adminController');

const {
  formAccountView, submitFormAccount, listAccountsView, updateAccountView, updateFormAccount, deleteFormAccount,
  formDepartmentView, submitFormDepartment, listDepartmentsView, updateDepartmentView, updateFormDepartment, deleteFormDepartment,
  formCategoryView, submitFormCategory, listCategoriesView, deleteFormCategory, updateCategoryView, updateFormCategory,
  formEventView, submitFormEvent, listEventsView, deleteFormEvent, updateEventView, updateFormEvent, setDateFormEvent
} = require('../controllers/adminController');



const { Role, User } = require('../models/User');

const multer = require('multer');
const upload = multer();

const { Idea, Category, CommentModel, File } = require('../models/Idea');
const Event = require('../models/Event');

// Define Routes
const router = express.Router();
router.get('/login', loginView);
router.post("/login", loginUser);

router.get("/", protectRoute, dashboardView2);

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
router.get('/formEvent', checkRole('Admin'), formEventView);
router.post('/submitFormEvent', checkRole('Admin'), submitFormEvent);
router.get('/listEvents', checkRole('Admin'), listEventsView);
router.get('/updateEvent/:id', checkRole('Admin'), updateEventView);
router.post('/updateFormEvent', checkRole('Admin'), updateFormEvent);
router.post('/deleteEvent/:id', checkRole('Admin'), deleteFormEvent);
router.post('/setDate/:id', checkRole('Admin'), setDateFormEvent);

// End: Route Admin site

// ------ STAFF -----------
router.get('/myideas', getMyIdeasPage)
router.get('/upload', checkRole('Staff'), getUploadPage);
router.post('/upload', upload.array('files'), uploadFile);
// ------ STAFF END --------------


router.get('/detailIdeas/:id', async (req, res) => {
  const user = req.user
  const role = await Role.findById(user.role);
  user.role = role;
  const files = await File.find({ ideas: req.params.id });
  const idea = await Idea
    .findById(req.params.id)
    .populate('user', 'username')
    .populate('category', 'nameCate');

  const formattedList = {
    createdDate: moment(idea.createdDate).tz(timezone).format(dateTimeFormat)
  };
  if (!idea.viewedBy.includes(req.user._id)) {
    // User hasn't viewed the idea before, so update the viewedBy array and increment the view count
    idea.viewedBy.push(req.user._id);
    await idea.save();
  }



  const title = 'Detail';
  const comments = await CommentModel.find({
    idea: req.params.id
  }).populate('user', 'username');
  res.render('detailIdeas', { title, idea, comments, user, files, formattedList })
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
  const check = await Event.hasTrueStatusComment();

  if (check) {
    console.log(req.query)
    const { comment, anonymous } = req.query;
    const cmt = await CommentModel.create({
      idea: req.params.id,
      comment: comment,
      user: req.user._id,
      anonymous: anonymous === 'true'
    });

    const populateComment = await CommentModel.findById(cmt._id).populate('user', 'username')
    console.log(populateComment)
    res.json({
      message: "success",
      data: populateComment,
    })
  }

  // Cần hiện thông báo khi không thể comment được
  else {
    console.log("can not comment");
  }
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

module.exports = router;