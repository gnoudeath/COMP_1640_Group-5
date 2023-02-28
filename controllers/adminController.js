
const User = require('../models/User');

// Start: GET: Home Page
const dashboardView = async (req, res) => {
    try {
        const title = 'Home';
        const user = req.user;

        // If the user has a role, fetch the role data using the populate() method
        if (user.role) {
            const role = await User.Role.findById(user.role);
            user.role = role;
            if (role.name === "Admin") res.render('Admin/home', { user, title });
            else if (role.name === "Staff") res.render('Staff/home', { user, title });
        }
        else {
            res.render('login_page');
        }


    } catch (error) {
        console.error(error);
        res.redirect('/');
        // res.status(500).send('Internal Server Error');
    }
};
// End: GET: Home Page

// Start: GET: Create Account Page
const formAccountView = async (req, res) => {
    try {
        const title = 'Create Account';
        const user = req.user;

        // If the user has a role, fetch the role data using the populate() method
        if (user.role) {
            const role = await User.Role.findById(user.role);
            user.role = role;
        }

        const allRoles = await User.getAllRoles();

        res.render('Admin/formAccount', { user, title, allRoles })

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
}
// End: GET: Create Account Page

// Start: POST: Create Account
const submitFormAccount = (req, res, next) => {
    awaitUser.insertUser(req.body);
    console.log(req.body);
    res.redirect('/listAccounts');
};
// End: POST: Create Account

// Start: GET: List Account Page
const listAccountsView = async (req, res, next) => {
    try {
        const title = 'List Accounts';
        const user = req.user;

        // If the user has a role, fetch the role data using the populate() method
        if (user.role) {
            const role = await User.Role.findById(user.role);
            user.role = role;
        }

        const staffs = await User.getAccountsByRoleName("Staff");
        const qa_managers = await User.getAccountsByRoleName("QA Manager");
        const qa_coordinators = await User.getAccountsByRoleName("QA Coordinator");

        res.render('Admin/listAccounts', { user, title, qa_managers, qa_coordinators, staffs });

    } catch (error) {
        console.error(error);
        res.redirect('/');
        // res.status(500).send('Internal Server Error');
    }
}
// Start: GET: List Account Page

// Start: GET: Update Account Page
const updateAccountView = async (req, res) => {
    try {
        const title = 'Update Account';
        const user = req.user;

        // If the user has a role, fetch the role data using the populate() method
        if (user.role) {
            const role = await User.Role.findById(user.role);
            user.role = role;
        }

        const allRoles = await User.getAllRoles();

        User.User.findById(req.params.id, (error, data) => {
            res.render('Admin/updateAccount', { user, title, allRoles, account: data });
        });


    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
};
// Start: GET: Update Account Page


module.exports = {
    dashboardView, formAccountView, submitFormAccount, listAccountsView, updateAccountView
};