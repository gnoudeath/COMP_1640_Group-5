const Event = require('../models/Event');
const Idea = require('../models/Idea');
const User = require('../models/User');

async function GetUser(user) {
    // If the user has a role, fetch the role data using the populate() method
    if (user.role) {
        const role = await User.Role.findById(user.role);
        user.role = role;
    }
}

// Start: GET: Create Account Page
const formAccountView = async (req, res) => {
    try {
        const messages = req.flash('error');
        const title = 'Create Account';
        const user = req.user;

        await GetUser(user);

        const allRoles = await User.getAllRoles();
        const allDepartments = await User.getAllDepartments();

        res.render('Admin/formAccount', { messages, user, title, allRoles, allDepartments })

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
}
// End: GET: Create Account Page

// Start: POST: Create Account
const submitFormAccount = async (req, res, next) => {
    const account = await User.checkAccountExists(req.body.username);
    if (account == false) {
        User.insertUser(req.body);
        req.flash('success', `Created Account "${req.body.username}" Successfully`);
        res.redirect('/listAccounts');
    }

    else {
        req.flash('error', `Username Existed. Please try again!!!`);
        res.redirect('/formAccount');
    }
};
// End: POST: Create Account

// Start: GET: List Account Page
const listAccountsView = async (req, res, next) => {
    try {
        const messages = req.flash('success');
        const title = 'List Accounts';
        const user = req.user;

        await GetUser(user);

        const staffs = await User.getAccountsByRoleName("Staff");
        const qa_managers = await User.getAccountsByRoleName("QA Manager");
        const qa_coordinators = await User.getAccountsByRoleName("QA Coordinator");

        const test = await User.getAccountsByRoleNameAndDepartmentName("Staff", "IT");


        res.render('Admin/listAccounts', { messages, user, title, qa_managers, qa_coordinators, staffs });

    } catch (error) {
        console.error(error);
        res.redirect('/');
        // res.status(500).send('Internal Server Error');
    }
}
// End: GET: List Account Page

// Start: GET: Update Account Page
const updateAccountView = async (req, res) => {
    try {
        const title = 'Update Account';
        const user = req.user;

        await GetUser(user);

        const allRoles = await User.getAllRoles();
        const allDepartments = await User.getAllDepartments();
        const account = await User.getAccountByID(req.params.id);

        res.render('Admin/updateAccount', { user, title, allRoles, allDepartments, account });

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
};
// End: GET: Update Account Page

// Start: POST: Update Account
const updateFormAccount = async (req, res) => {
    await User.updateAccount(req.body.id, req.body);
    res.redirect('/listAccounts');
}
// End: POST: Update Account

// Start: POST: Delete Account
const deleteFormAccount = async (req, res) => {
    await User.deleteAccount(req.params.id);
    res.redirect('/listAccounts');
}
// End: POST: Delete Account

// Start: GET: Create Department Page
const formDepartmentView = async (req, res) => {
    try {
        const title = 'Create Department';
        const user = req.user;

        await GetUser(user);

        res.render('Admin/formDepartment', { user, title })

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
}
// End: GET: Create Department Page


// Start: POST: Create Department
const submitFormDepartment = (req, res, next) => {
    User.insertDepartment(req.body);
    res.redirect('/listDepartments');
};
// End: POST: Create Department

// Start: GET: List Departments Page
const listDepartmentsView = async (req, res, next) => {
    try {
        const title = 'List Departments';
        const user = req.user;

        await GetUser(user);

        const departments = await User.getAllDepartments();

        res.render('Admin/listDepartments', { user, title, departments });

    } catch (error) {
        console.error(error);
        res.redirect('/');
        // res.status(500).send('Internal Server Error');
    }
}
// End: GET: List Departments Page

// Start: GET: Update Department Page
const updateDepartmentView = async (req, res) => {
    try {
        const title = 'Update Department';
        const user = req.user;

        await GetUser(user);

        const department = await User.getDepartmentByID(req.params.id);

        res.render('Admin/updateDepartment', { user, title, department });

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
};
// End: GET: Update Department Page

// Start: POST: Update Department
const updateFormDepartment = async (req, res) => {
    await User.updateDepartment(req.body.id, req.body);
    res.redirect('/listDepartments');
}
// End: POST: Update Department

// Start: POST: Delete Department
const deleteFormDepartment = async (req, res) => {
    await User.deleteDepartment(req.params.id);
    res.redirect('/listDepartments');
}
// End: POST: Delete Department

// Start: GET: Create Event Page
const formEventView = async (req, res) => {
    try {
        const title = 'Create Event';
        const user = req.user;

        await GetUser(user);

        res.render('Admin/formEvent', { user, title })

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
}
// End: GET: Create Event Page

// Start: POST: Create Event
const submitFormEvent = (req, res, next) => {
    Event.insertEvent(req.body);
    res.redirect('/listEvents');
};
// End: POST: Create Event

// Start: GET: List Events Page
const listEventsView = async (req, res, next) => {
    try {
        const title = 'List Events';
        const user = req.user;

        await GetUser(user);

        const events = await Event.getAllEvents();

        res.render('Admin/listEvents', { user, title, events });

    } catch (error) {
        console.error(error);
        res.redirect('/');
        // res.status(500).send('Internal Server Error');
    }
}
// End: GET: List Events Page

// Start: GET: Update Event Page
const updateEventView = async (req, res) => {
    try {
        const title = 'Update Event';
        const user = req.user;

        await GetUser(user);

        const event = await Event.getEventByID(req.params.id);

        res.render('Admin/updateEvent', { user, title, event });

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
};
// End: GET: Update Event Page

// Start: POST: Update Event
const updateFormEvent = async (req, res) => {
    await Event.updateEvent(req.body.id, req.body);
    res.redirect('/listEvents');
};
// End: POST: Update Event

// Start: POST: Delete Event
const deleteFormEvent = async (req, res) => {
    await Event.deleteEvent(req.params.id);
    res.redirect('/listEvents');
};
// End: POST: Delete Event

// Start: POST: Set Date
const setDateFormEvent = async (req, res) => {
    await Event.setDate(req.params.id);
    res.redirect('/listEvents');
};
// End: POST: Set Date


module.exports = {
    formAccountView, submitFormAccount, listAccountsView, updateAccountView, updateFormAccount, deleteFormAccount,                      // Function: Admin
    formDepartmentView, submitFormDepartment, listDepartmentsView, updateDepartmentView, updateFormDepartment, deleteFormDepartment,    // Function: Department
    formEventView, submitFormEvent, listEventsView, updateEventView, updateFormEvent, deleteFormEvent, setDateFormEvent                 // Function: Event
};