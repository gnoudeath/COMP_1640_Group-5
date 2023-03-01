const express = require('express');

const { loginView, loginUser } = require('../controllers/loginController');

const { protectRoute } = require("../auth/protect");
const { logoutUser, dashboardView, } = require('../controllers/loginController');

const { formAccountView, submitFormAccount, listAccountsView, updateAccountView, updateFormAccount, deleteFormAccount } = require('../controllers/adminController');
const { Role, User } = require('../models/User');

const {Idea,Category} = require('../models/Idea');

// Define Routes
const router = express.Router();
router.get('/login', loginView);
router.post("/login", loginUser);

router.get("/", protectRoute, dashboardView);

router.get('/logout', logoutUser);

// Start: Route Admin site
router.get('/formAccount', formAccountView);
router.post('/submitFormAccount', submitFormAccount);
router.get('/listAccounts', listAccountsView);
router.get('/updateAccount/:id', updateAccountView);
router.post('/updateFormAccount', updateFormAccount);
router.post('/deleteAccount/:id', deleteFormAccount);

// End: Route Admin site

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

// Staff route

//   router.get('/testaddcat', async (req, res) => {
      
//     const newCategory = new Category({
//         name: 'My Simple Category',
        
//         // other properties of your category schema
//       });
//       newCategory.save((err) => {
//         if (err) {
//           console.error(err);
//           res.status(500).send('Error saving category to database');
//         } else {
//           console.log('New category saved to database');
//           res.send(`New category "${newCategory.name}" saved to database`);
//         }
//       });
//   });

  router.get('/fake', async(req, res, next) =>{
    for(let i = 0; i < 24; i++) {
    const idea = new Idea();
    idea.title = `Idea ${i}`,
    idea.content = `This is the ${i}${i == 1 ? "st" : i == 2 ? "nd" : i == 3 ? "rd" : "th"} idea`,
    idea.user = '63fd7c066d913319b0fa85a2',
    idea.category = '63ff39a6d4e860420b69ddea'
    
    idea.save((err)=>{
        if (err) { return next(err); }
      });
    }
    res.redirect('/');    
}) 
router.get('/:page',async(req, res, next) => {
    let perPage = 6;
    let page = req.params.page || 1; 
    let title = 'Home'
    const user = req.user;
    const role = await Role.findById(user.role);
    user.role = role;
    
    Idea
      .find()
      .populate('user','username')
      .populate('category','name') // find tất cả các data
      .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
      .limit(perPage)
      .exec((err, ideas) => {
        Idea.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
          if (err) return next(err);
          res.render('Staff/home', {
            user,
            ideas, // sản phẩm trên một page
            current: page, // page hiện tại
            pages: Math.ceil(count / perPage), // tổng số các page
            title:title
          }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
        });
      });
      
})
router.get('/last-ideas/:page', async (req, res, next) => {
    let perPage = 6;
    let page = req.params.page || 1; 
    let title = 'Home'
    let filter = 'last-ideas'
    const user = req.user;
    const role = await Role.findById(user.role);
    user.role = role;
    
    Idea
      .find()
      .sort({createdDate: -1})
      .populate('user','username')
      .populate('category','name') // find tất cả các data
      .skip((perPage * page) - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
      .limit(perPage)
      .exec((err, ideas) => {
        Idea.countDocuments((err, count) => { // đếm để tính có bao nhiêu trang
          if (err) return next(err);
          res.render('Staff/home', {
            user,
            filter:filter,
            ideas, // sản phẩm trên một page
            current: page, // page hiện tại
            pages: Math.ceil(count / perPage), // tổng số các page
            title:title
          }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
        
    });
      });
      
})

   
// End Staff Route

module.exports = router;