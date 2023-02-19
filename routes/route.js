const express = require('express');
const { loginView,loginUser } = require('../controllers/loginController');
const { dashboardView } = require("../controllers/indexController");
const { protectRoute } = require("../auth/protect");
const { logoutUser } = require('../controllers/loginController');
const router = express.Router();
router.get('/login', loginView);
router.get("/", protectRoute, dashboardView);
router.post("/login", loginUser);
router.get('/logout', logoutUser);
router.get('/staff',(req,res)=>{
    res.render('staff_index',{user:req.user})
})
module.exports = router;