
const Role = require('../models/User');

const dashboardView = async (req, res) => {
    try {
        const user = req.user;

        // If the user has a role, fetch the role data using the populate() method
        if (user.role) {
            const role = await Role.Role.findById(user.role);
            user.role = role;
        }

        res.render('Admin/home', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

};

module.exports = {
    dashboardView,
};