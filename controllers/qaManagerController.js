const { File, getAllCategorys, getCategoryByID, updateCategory, deleteCategory, insertCategory } = require('../models/Idea');
const archiver = require('archiver');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { Idea } = require('../models/Idea');
const iconv = require('iconv-lite');
const User = require('../models/User');

async function GetUser(user) {
    // If the user has a role, fetch the role data using the populate() method
    if (user.role) {
        const role = await User.Role.findById(user.role);
        user.role = role;
    }
}

// Start: GET: Create Category Page
const formCategoryView = async (req, res) => {
    try {
        const title = 'Create Category';
        const user = req.user;

        await GetUser(user);

        res.render('QA_Manager/formCategory', { user, title })

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
}
// End: GET: Create Category Page

// Start: POST: Create Category
const submitFormCategory = (req, res, next) => {
    insertCategory(req.body);
    res.redirect('/listCategories');
};
// End: POST: Create Category

// Start: GET: List Categories Page
const listCategoriesView = async (req, res, next) => {
    try {
        const title = 'List Categories';
        const user = req.user;

        await GetUser(user);

        const categories = await getAllCategorys();

        res.render('QA_Manager/listCategories', { user, title, categories });

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

        await GetUser(user);

        const category = await getCategoryByID(req.params.id);

        res.render('QA_Manager/updateCategory', { user, title, category });

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
};
// End: GET: Update Category Page

// Start: POST: Update Category
const updateFormCategory = async (req, res) => {
    await updateCategory(req.body.id, req.body);
    res.redirect('/listCategories');
}
// End: POST: Update Category


// Start: POST: Delete Category
const deleteFormCategory = async (req, res) => {
    await deleteCategory(req.params.id);
    res.redirect('/listCategories');
}
// End: POST: Delete Category


const downloadZipDocs = async (req, res) => {
    try {
        const uploads = await File.find();

        const archive = archiver('zip', { zlib: { level: 9 } });

        uploads.forEach(upload => {
            archive.append(upload.files, { name: upload.name });
        });

        res.attachment('uploads.zip');

        archive.pipe(res);
        archive.finalize();
    } catch (error) {
        next(error);
    }
}

// Sử dụng đối tượng Intl.DateTimeFormat để định dạng ngày giờ
const dateTimeFormat = new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
});

const exportIdeasToCsv = async (_req, res) => {
    try {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="ideas.csv"');
        const csvWriter = createCsvWriter({
            path: 'ideas.csv',
            header: [
                { id: 'title', title: 'Title' },
                { id: 'content', title: 'Content' },
                { id: 'createdDate', title: 'Created Date' },
                { id: 'closedDate', title: 'Closed Date' },
                { id: 'category', title: 'Category' },
                { id: 'user', title: 'User' },
                { id: 'viewedBy', title: 'Viewed' },
                { id: 'likedBy', title: 'Liked' },
                { id: 'dislikedBy', title: 'Disliked' },
                { id: 'isAnonymous', title: 'Is Anonymous' }
            ],
            encoding: 'utf8' //Thêm option encoding với giá trị utf8
        });
        const csvData = await Idea.find({})
            .populate('category', 'nameCate')
            .populate('user', 'username')
            .exec()
            .then((ideas) => {
                return ideas.map((idea) => {
                    return {
                        title: iconv.encode(idea.title, 'utf8').toString(),
                        content: iconv.encode(idea.content, 'utf8').toString(),
                        createdDate: dateTimeFormat.format(idea.createdDate),
                        closedDate: idea.closedDate ? dateTimeFormat.format(idea.closedDate) : '',
                        category: idea.category.nameCate,
                        user: idea.user.username,
                        viewedBy: idea.viewedBy.length,
                        likedBy: idea.likedBy.length,
                        dislikedBy: idea.dislikedBy.length,
                        isAnonymous: idea.isAnonymous ? 'Yes' : 'No'
                    };
                });
            });

        // Write the CSV data to a file
        await csvWriter.writeRecords(csvData);

        // Set the character encoding and download the file
        res.download('ideas.csv');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
};


module.exports = {
    formCategoryView, submitFormCategory, listCategoriesView, updateCategoryView, updateFormCategory, deleteFormCategory, // Function: Category
    downloadZipDocs, exportIdeasToCsv
};