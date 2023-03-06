const express = require('express');

const { loginView, loginUser } = require('../controllers/loginController');

const { protectRoute,checkRole } = require("../auth/protect");
const { logoutUser, dashboardView, } = require('../controllers/loginController');

const staffController = require('../controllers/staffController');
const qaManagerController = require('../controllers/adminController');

const {
  formAccountView, submitFormAccount, listAccountsView, updateAccountView, updateFormAccount, deleteFormAccount,
  formDepartmentView, submitFormDepartment, listDepartmentsView, updateDepartmentView, updateFormDepartment, deleteFormDepartment,
  formCategoryView, submitFormCategory, listCategoriesView, deleteFormCategory, updateCategoryView, updateFormCategory
} = require('../controllers/adminController');



const { Role, User } = require('../models/User');

const multer = require('multer');
const upload = multer();

const { Idea, Category, CommentModel } = require('../models/Idea');

// Define Routes
const router = express.Router();
router.get('/login', loginView);
router.post("/login", loginUser);

router.get("/", protectRoute, dashboardView);

router.get('/logout', logoutUser);

// Start: Route Admin site

// Section: Account
router.get('/formAccount',checkRole('Admin'), formAccountView);
router.post('/submitFormAccount',checkRole('Admin'), submitFormAccount);
router.get('/listAccounts',checkRole('Admin'), listAccountsView);
router.get('/updateAccount/:id',checkRole('Admin'), updateAccountView);
router.post('/updateFormAccount',checkRole('Admin'), updateFormAccount);
router.post('/deleteAccount/:id',checkRole('Admin'), deleteFormAccount);

// Section: Department
router.get('/formDepartment',checkRole('Admin'), formDepartmentView);
router.post('/submitFormDepartment',checkRole('Admin'), submitFormDepartment);
router.get('/listDepartments',checkRole('Admin'), listDepartmentsView);
router.get('/updateDepartment/:id',checkRole('Admin'), updateDepartmentView);
router.post('/updateFormDepartment',checkRole('Admin'), updateFormDepartment);
router.post('/deleteDepartment/:id',checkRole('Admin'), deleteFormDepartment);

// Section: Category
router.get('/formCategory',checkRole(['Admin','QA Manager']), formCategoryView);
router.post('/submitFormCategory',checkRole(['Admin','QA Manager']), submitFormCategory);
router.get('/listCategories',checkRole(['Admin','QA Manager']), listCategoriesView);
router.get('/updateCategory/:id',checkRole(['Admin','QA Manager']), updateCategoryView);
router.post('/updateFormCategory',checkRole(['Admin','QA Manager']), updateFormCategory);
router.post('/deleteCategory/:id',checkRole(['Admin','QA Manager']), deleteFormCategory);


// End: Route Admin site

// Start: Route Staff site
router.get('/upload',checkRole('Staff'),async (req, res) => {
  const user = req.user
  const role = await Role.findById(user.role);
  const category = await Category.find()
  user.role = role;
  const title = "Upload";
  res.render('Staff/upload', {
    title: title,
    user: user,
    category: category,
  })
});
router.post('/upload', upload.array('files'), staffController.uploadFile);
// End: Route Staff site


router.get('/detailIdeas/:id', async(req,res)=>{
  const idea = await Idea
  .findById(req.params.id)
  .populate()
  const title = 'Detail';
  const comments = await CommentModel.find({
    idea: req.params.id
  });
  console.log(comments)
  res.render('Staff/detailIdeas',{title, idea, comments})
})

router.post('/likeIdeas/:id', async (req,res) => {
  // save data to db 
  let idea = await Idea
  .findById(req.params.id);
  if(idea.like){
    idea.like = idea.like + 1
  }else{
    idea.like = 1
  }
  idea = await Idea.findOneAndUpdate({_id: req.params.id}, {
    like: idea.like
  })
  res.json({
    message: "success",
    data: idea
  })
})


router.post('/disLikeIdeas/:id', async (req,res) => {
  // save data to db 
  let idea = await Idea
  .findById(req.params.id);
  if(idea.dislike){
    idea.dislike = idea.dislike + 1
  }else{
    idea.dislike = 1
  }
  idea = await Idea.findOneAndUpdate({_id: req.params.id}, {
    dislike: idea.dislike
  })
  res.json({
    message: "success",
    data: idea
  })
})


router.post("/comment/:id", async(req,res) => {
  console.log(req.query)
  const {comment} = req.query;
  const data = await CommentModel.create({
    idea: req.params.id,
    comment: comment
  });
  res.json({
    message: "success",
    data
  })
})

router.post('/upload', upload.array('files'), staffController.uploadFile);
// Start: Route QA Manager Site
// Section: Category
// router.get('/formCategory', qaManagerController.formCategoryView);
// router.post('/submitFormCategory', submitFormCategory);
// router.get('/listCategories', listCategoriesView);
// router.get('/updateCategory/:id', updateCategoryView);
// router.post('/updateFormCategory', updateFormCategory);
// router.post('/deleteCategory/:id', deleteFormCategory);
// End: Route QA Manager Site

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





//   router.get('/fake', async(req, res, next) =>{
//     for(let i = 0; i < 24; i++) {
//     const idea = new Idea();
//     idea.title = `Idea ${i}`,
//     idea.content = `This is the ${i}${i == 1 ? "st" : i == 2 ? "nd" : i == 3 ? "rd" : "th"} idea`,
//     idea.user = '63fd7c066d913319b0fa85a2',
//     idea.category = '63ff39a6d4e860420b69ddea'

//     idea.save((err)=>{
//         if (err) { return next(err); }
//       });
//     }
//     res.redirect('/');    
// })

// ERROR PAGE
router.get('/error',(req,res)=>{
  res.render("error",{
    layout: 'error',
  })
})
// END ERROR PAGE

// Index List Ideas
router.get('/:page',protectRoute, async (req, res, next) => {
  let perPage = 6;
  let page = req.params.page || 1;
  let title = 'Home'
  const user = req.user;
  const role = await Role.findById(user.role);
  user.role = role;

  Idea
    .find()
    .populate('user', 'username')
    .populate('category', 'name') // find tất cả các data
    .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, ideas) => {
      Idea.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        if (role.name === "Admin") res.render('Admin/home', { user, ideas, current: page, pages: Math.ceil(count / perPage), title: title });
        else if (role.name === "Staff") res.render('Staff/home', { user, ideas, current: page, pages: Math.ceil(count / perPage), title: title });
      });
    });

})
router.get('/last-ideas/:page',protectRoute, async (req, res, next) => {
  let perPage = 6;
  let page = req.params.page || 1;
  let title = 'Home'
  let filter = 'last-ideas'
  const user = req.user;
  const role = await Role.findById(user.role);
  user.role = role;

  Idea
    .find()
    .sort({ createdDate: -1 })
    .populate('user', 'username')
    .populate('category', 'name') // find tất cả các data
    .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, ideas) => {
      Idea.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        res.render('Staff/home', {
          user,
          filter: filter,
          ideas, // sản phẩm trên một page
          current: page, // page hiện tại
          pages: Math.ceil(count / perPage), // tổng số các page
          title: title
        }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...

      });
    });

})
// End Index List Ideas



module.exports = router;