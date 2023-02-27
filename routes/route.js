const express = require('express');

const { loginView, loginUser } = require('../controllers/loginController');

const { protectRoute } = require("../auth/protect");
const { logoutUser } = require('../controllers/loginController');

const { dashboardView } = require('../controllers/adminController');

// Define Routes
const router = express.Router();
router.get('/login', loginView);
router.post("/login", loginUser);

router.get("/", protectRoute, dashboardView);

router.get('/logout', logoutUser);
module.exports = router;