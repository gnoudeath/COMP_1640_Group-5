const express = require('express');
const mongoose = require('mongoose');
const dateTimeFormat = 'DD/MM/YYYY HH:mm';
const moment = require('moment-timezone');
const timezone = 'Asia/Ho_Chi_Minh';
const mailer = require('../utils/mailer');
const contentMail = require('../utils/contentMail');

const { loginView, loginUser } = require('../controllers/loginController');

const { protectRoute, checkRole } = require("../auth/protect");
const { logoutUser, dashboardView, dashboardView2 } = require('../controllers/loginController');

const { getUploadPage, uploadFile, getMyIdeasPage } = require('../controllers/staffController');

// Start: Has Functions Site Admin
const {
  formAccountView, submitFormAccount, listAccountsView, updateAccountView, updateFormAccount, deleteFormAccount,
  formDepartmentView, submitFormDepartment, listDepartmentsView, updateDepartmentView, updateFormDepartment, deleteFormDepartment,
  formEventView, submitFormEvent, listEventsView, deleteFormEvent, updateEventView, updateFormEvent, setDateFormEvent
} = require('../controllers/adminController');
// End: Has Functions Site Admin

// Start: Has Functions Site QA Manager
const {
  formCategoryView, submitFormCategory, listCategoriesView, deleteFormCategory, updateCategoryView, updateFormCategory, downloadZipDocs, exportIdeasToCsv, dashboardForQAM, checkData5s
} = require('../controllers/qaManagerController');
// End: Has Functions Site QA Manager


const { Role, getAccountByID } = require('../models/User');

const multer = require('multer');
const upload = multer();

const { Idea, Category, CommentModel, File } = require('../models/Idea');
const Event = require('../models/Event');

// Define Routes
const router = express.Router();
router.get('/login', loginView);
router.post("/login", loginUser);

router.get("/", protectRoute, dashboardView);

router.get('/logout', logoutUser);

// -------------- Start: Route Admin site --------------

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

// Section: Set Date
router.get('/formEvent', checkRole('Admin'), formEventView);
router.post('/submitFormEvent', checkRole('Admin'), submitFormEvent);
router.get('/listEvents', checkRole('Admin'), listEventsView);
router.get('/updateEvent/:id', checkRole('Admin'), updateEventView);
router.post('/updateFormEvent', checkRole('Admin'), updateFormEvent);
router.post('/deleteEvent/:id', checkRole('Admin'), deleteFormEvent);
router.post('/setDate/:id', checkRole('Admin'), setDateFormEvent);

// -------------- End: Route Admin site --------------

// -------------- Start: Route Staff site --------------
router.get('/myideas', getMyIdeasPage)
router.get('/upload', checkRole('Staff'), getUploadPage);
router.post('/upload', upload.array('files'), uploadFile);
// -------------- End: Route Staff site --------------

// -------------- Start: Route QA Manager site --------------
// Section: Category
router.get('/formCategory', checkRole('QA Manager'), formCategoryView);
router.post('/submitFormCategory', checkRole('QA Manager'), submitFormCategory);
router.get('/listCategories', checkRole('QA Manager'), listCategoriesView);
router.get('/updateCategory/:id', checkRole('QA Manager'), updateCategoryView);
router.post('/updateFormCategory', checkRole('QA Manager'), updateFormCategory);
router.post('/deleteCategory/:id', checkRole('QA Manager'), deleteFormCategory);

router.get('/dashboardForQAM', checkRole('QA Manager'), dashboardForQAM);

router.get('/api/data', checkData5s);

// -------------- End: Route QA Manager site --------------


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

  let isLiked = false;
  let isDisliked = false;

  if (idea.likedBy.includes(req.user._id)) {
    isLiked = true;
  } else if (idea.dislikedBy.includes(req.user._id)) {
    isDisliked = true;
  }

  const numLikes = idea.likedBy.length;
  const numDislikes = idea.dislikedBy.length;
  const title = 'Detail';
  const comments = await CommentModel.find({
    idea: req.params.id
  }).populate('user', 'username');

  const checkHasTrueStatusComment = await Event.hasTrueStatusComment();

  res.render('detailIdeas', { title, idea, comments, user, files, formattedList, checkHasTrueStatusComment, isLiked, isDisliked, numLikes, numDislikes })
})


router.post('/likeIdeas/:id', async (req, res) => {
  try {
    const user = req.user; // assuming user authentication middleware is used
    const ideaId = req.params.id;
    const idea = await Idea.findById(ideaId);

    // check if user has already liked the idea
    const isLiked = idea.likedBy.includes(user._id);
    if (isLiked) {
      return res.status(400).json({ message: 'You have already liked this idea.' });
    }

    // check if user has already disliked the idea
    const isDisliked = idea.dislikedBy.includes(user._id);
    if (isDisliked) {
      // remove user from dislikedBy array
      idea.dislikedBy.pull(user._id);
    }

    // add user to likedBy array
    idea.likedBy.push(user._id);

    // save updated idea
    await idea.save();

    const numLikes = idea.likedBy.length;
    const numDislikes = idea.dislikedBy.length;


    return res.json({ message: 'Idea liked successfully.', numLikes: numLikes, numDislikes: numDislikes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/dislikeIdeas/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).send('Idea not found');
    }
    if (idea.dislikedBy.includes(req.user._id)) {
      return res.status(400).send('Already disliked this idea');
    }
    if (idea.likedBy.includes(req.user._id)) {
      // Remove the user's like
      idea.likedBy.pull(req.user._id);
    }
    idea.dislikedBy.push(req.user._id);
    await idea.save();

    const numLikes = idea.likedBy.length;
    const numDislikes = idea.dislikedBy.length;
    res.json({ numLikes: numLikes, numDislikes: numDislikes });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.post("/comment/:id", async (req, res) => {
  const check = await Event.hasTrueStatusComment();

  if (check) {
    // console.log(req.query)
    const { comment, anonymous } = req.query;
    const cmt = await CommentModel.create({
      idea: req.params.id,
      comment: comment,
      user: req.user._id,
      anonymous: anonymous === 'true'
    });

    const populateComment = await CommentModel.findById(cmt._id).populate('user', 'username')
    // console.log(populateComment)
    res.json({
      message: "success",
      data: populateComment,
    })

    const idea = await Idea.findById(req.params.id);
    const user = await getAccountByID(idea.user);

    const now = new Date();
    const currentDateTime = moment(now).tz(timezone).format(dateTimeFormat);

    mailer.sendMail(
      user.email,               // Gửi đến email nào
      "Notification Comment",   // Tên tiêu đề
      contentMail.GetContentMailAfterComment(anonymous == "true" ? "Unknown" : req.user.fullName, anonymous == "true" ? "Unknown" : req.user.username, currentDateTime, idea.title, comment) // Nội dung trong email
    );
  }

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

router.get('/downloads', downloadZipDocs)
// END ERROR PAGE

// csv
router.get('/export-ideas', exportIdeasToCsv);

module.exports = router;