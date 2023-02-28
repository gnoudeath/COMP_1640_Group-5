const express = require('express');

const { loginView, loginUser } = require('../controllers/loginController');

const { protectRoute } = require("../auth/protect");
const { logoutUser,dashboardView, } = require('../controllers/loginController');

const {  formAccountView, submitFormAccount, listAccountsView, updateAccountView } = require('../controllers/adminController');
const { Role } = require('../models/User');

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
});

module.exports = router;