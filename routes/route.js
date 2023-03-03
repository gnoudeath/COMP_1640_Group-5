const express = require('express');

const { loginView, loginUser } = require('../controllers/loginController');

const { protectRoute,isAdmin,isCoordinator,isManager,isStaff } = require("../auth/protect");
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

const { Idea, Category } = require('../models/Idea');

// Define Routes
const router = express.Router();
router.get('/login', loginView);
router.post("/login", loginUser);

router.get("/", protectRoute, dashboardView);

router.get('/logout', logoutUser);

// Start: Route Admin site

// Section: Account
router.get('/formAccount',isAdmin, formAccountView);
router.post('/submitFormAccount',isAdmin, submitFormAccount);
router.get('/listAccounts',isAdmin, listAccountsView);
router.get('/updateAccount/:id',isAdmin, updateAccountView);
router.post('/updateFormAccount',isAdmin, updateFormAccount);
router.post('/deleteAccount/:id',isAdmin, deleteFormAccount);

// Section: Department
router.get('/formDepartment',isAdmin, formDepartmentView);
router.post('/submitFormDepartment',isAdmin, submitFormDepartment);
router.get('/listDepartments',isAdmin, listDepartmentsView);
router.get('/updateDepartment/:id',isAdmin, updateDepartmentView);
router.post('/updateFormDepartment',isAdmin, updateFormDepartment);
router.post('/deleteDepartment/:id',isAdmin, deleteFormDepartment);

// Section: Category
router.get('/formCategory',isAdmin, formCategoryView);
router.post('/submitFormCategory',isAdmin, submitFormCategory);
router.get('/listCategories',isAdmin, listCategoriesView);
router.get('/updateCategory/:id',isAdmin, updateCategoryView);
router.post('/updateFormCategory',isAdmin, updateFormCategory);
router.post('/deleteCategory/:id',isAdmin, deleteFormCategory);


// End: Route Admin site

// Start: Route Staff site
router.get('/upload',isStaff ,async (req, res) => {
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
        if (role.name === "Admin") res.render('Staff/home', { user, ideas, current: page, pages: Math.ceil(count / perPage), title: title });
        else if (role.name === "Staff") res.render('Admin/home', { user, ideas, current: page, pages: Math.ceil(count / perPage), title: title });
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