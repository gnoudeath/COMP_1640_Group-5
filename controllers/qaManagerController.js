const Idea = require('../models/Idea');

// Start: GET: Create Category Page
const formCategoryView = async (req, res) => {
    try {
        const title = 'Create Category';
        const user = req.user;

        // If the user has a role, fetch the role data using the populate() method
        if (user.role) {
            const role = await User.Role.findById(user.role);
            user.role = role;
        }

        res.render('QA_Manger/formCategory', { user, title })

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
}
// End: GET: Create Category Page

// Start: POST: Create Category
const submitFormCategory = (req, res, next) => {
    Idea.insertCategory(req.body);
    res.redirect('/listCategories');
};
// End: POST: Create Category

// Start: GET: List Categories Page
const listCategoriesView = async (req, res, next) => {
    try {
        const title = 'List Categories';
        const user = req.user;

        // If the user has a role, fetch the role data using the populate() method
        if (user.role) {
            const role = await User.Role.findById(user.role);
            user.role = role;
        }

        const categories = await Idea.getAllCategorys();

        res.render('QA_Manger/listCategories', { user, title, categories });

    } catch (error) {
        console.error(error);
        res.redirect('/');
        // res.status(500).send('Internal Server Error');
    }
}
// End: GET: List Categories Page

// Start: GET: Update Category Page
const updateCategoryView = async (req, res) => {
    try {
        const title = 'Update Category';
        const user = req.user;

        // If the user has a role, fetch the role data using the populate() method
        if (user.role) {
            const role = await User.Role.findById(user.role);
            user.role = role;
        }

        const category = await Idea.getCategoryByID(req.params.id);

        res.render('QA_Manger/updateCategory', { user, title, category });

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
};
// End: GET: Update Category Page

// Start: POST: Update Category
const updateFormCategory = async (req, res) => {
    await Idea.updateCategory(req.body.id, req.body);
    res.redirect('/listCategories');
}
// End: POST: Update Category


// Start: POST: Delete Category
const deleteFormCategory = async (req, res) => {
    await Idea.deleteCategory(req.params.id);
    res.redirect('/listCategories');
}
// End: POST: Delete Category

module.exports = {
    formCategoryView, submitFormCategory, listCategoriesView, updateCategoryView, updateFormCategory, deleteFormCategory                // Function: Category
};