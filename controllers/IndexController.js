
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
            if(role.name === "Admin") res.render('Admin/home', { user });
            else if (role.name === "Staff") res.render('Staff/home', { user });
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

        let allRoles = [];

        User.Role.find().exec((err, datas) => {
            if (err) {
                console.error(err);
            } else {
                allRoles = datas; // lưu kết quả vào biến ngoài allRoles
                res.render('Admin/formAccount', { user, title, allRoles })
            }
        });

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
}
// End: GET: Create Account Page

// Start: POST: Create Account
const submitFormAccount = (req, res, next) => {
    User.User.create(req.body);
    console.log(req.body);
    res.redirect('/listAccounts');
};
// End: POST: Create Account

// Start: GET: List Account Page
const listAccountsView = async (req, res, next) => {
    try {
        const title = 'List Accounts';
        const user = req.user;

        const data = [];

        // If the user has a role, fetch the role data using the populate() method
        if (user.role) {
            const role = await User.Role.findById(user.role);
            user.role = role;
        }

        User.Role.find().exec((err, datas) => {
            if (err) {
                console.error(err);
            } else {
                const allRoles = datas; // lưu kết quả vào biến allRoles

                allRoles.forEach(role => {
                    if (role.name === 'Staff') {
                        const role_ID = role._id;

                        console.log(role.name);
                        console.log(role_ID);

                        User.User.find({ role: role_ID })
                            .then(staffs => {
                                console.log(typeof staffs)

                                var staffss = staffs;

                                var resultArray = Object.keys(staffss).map(function (personNamedIndex) {
                                    let person = staffss[personNamedIndex];
                                    // do something with person
                                    return person;
                                });

                                res.render('Admin/listAccounts', { user, title, resultArray });

                            })
                            .catch(error => {
                                console.log(error);
                            });
                    }
                });
            }
        });




    } catch (error) {
        console.error(error);
        res.redirect('/');
        // res.status(500).send('Internal Server Error');
    }
}
// Start: GET: List Account Page


module.exports = {
    dashboardView, formAccountView, submitFormAccount, listAccountsView
};