const Idea = require('../models/Idea');
const { File, getAllCategorys, getCategoryByID, updateCategory, deleteCategory, insertCategory } = require('../models/Idea');
const archiver = require('archiver');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const iconv = require('iconv-lite');
const User = require('../models/User');
const Event = require('../models/Event');


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
        const messages = req.flash('notification');
        const title = 'List Categories';
        const user = req.user;

        await GetUser(user);

        const categories = await getAllCategorys();

        res.render('QA_Manager/listCategories', { messages, user, title, categories });

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
    const category = await Idea.getCategoryByID(req.params.id);
    const checkCategoryHasIdeas = await Idea.checkCategoryHasIdeas(req.params.id);
    if (checkCategoryHasIdeas == true) {
        await deleteCategory(req.params.id);
        req.flash('notification', `Deleted "${category.nameCate}" category`);
        res.redirect('/listCategories');
    }
    else {
        req.flash('notification', `Cannot delete "${category.nameCate}" category!!! Because this category is having ideas`);
        res.redirect('/listCategories');
    }

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
                { id: 'category', title: 'Category' },
                { id: 'user', title: 'User' },
                { id: 'viewedBy', title: 'Viewed' },
                { id: 'likedBy', title: 'Liked' },
                { id: 'dislikedBy', title: 'Disliked' },
                { id: 'isAnonymous', title: 'Is Anonymous' },
                { id: 'hasFiles', title: 'hasFiles' },
                { id: 'department', title: 'Department' },
            ],
            encoding: 'utf8' //Thêm option encoding với giá trị utf8
        });
        const csvData = await Idea.Idea.find({})
            .populate('category', 'nameCate')
            .populate({
                path: 'user', // Lấy trường user trong bảng idea
                select: 'username department', // Chọn tới trường username và department trong bảng user
                populate: {
                    path: 'department', // Tiếp tục lấy trường department trong bảng user
                    select: 'name' // Chọn tới trường name trong bảng department
                }
            })
            .populate('uploads')
            .exec()
            .then((ideas) => {
                return ideas.map((idea) => {
                    let hasFiles = "No";
                    if (idea.uploads.length > 0 && idea.uploads[0].files) {
                        hasFiles = "Yes";
                    }
                    return {
                        title: iconv.encode(idea.title, 'utf8').toString(),
                        content: iconv.encode(idea.content, 'utf8').toString(),
                        createdDate: dateTimeFormat.format(idea.createdDate),
                        category: idea.category.nameCate,
                        user: idea.user.username,
                        department: idea.user.department.name,
                        viewedBy: idea.viewedBy.length,
                        likedBy: idea.likedBy.length,
                        dislikedBy: idea.dislikedBy.length,
                        isAnonymous: idea.isAnonymous ? 'Yes' : 'No',
                        hasFiles: hasFiles,                       
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

// Start: GET: dashboardForQAM Page
const dashboardForQAM = async (req, res) => {
    try {
        const title = 'Dashboard';
        const user = req.user;

        await GetUser(user);

        const categories = await Idea.getAllCategorys();
        const ideas = await Idea.Idea.find();
        const departments = await User.getAllDepartments();
        const events = await Event.getAllEvents();

        const countCategories = categories.length;
        const countEvents = events.length;
        const countIdeas = ideas.length;
        const countDepartments = departments.length;

        const count = { countIdeas, countCategories, countDepartments, countEvents };

        res.render('QA_Manager/dashboardForQAM', { user, title, count });

    } catch (error) {
        console.error(error);
        // res.status(500).send('Internal Server Error');
        res.redirect('/');
    }
};
// End: GET: dashboardForQAM Page

const checkData5s = async function (req, res) {
    try {
        // Start: Xử lý data dành cho bar chart
        const categories = await Idea.getAllCategorys();

        const nameCategory = [];
        const countIdeasInCategory = [];

        for (const category of categories) {
            nameCategory.push(category.nameCate);
            const count = await Idea.getCountIdeaRecordsByCategoryName(category._id);
            countIdeasInCategory.push(count);
        }

        const barChartData = { nameCategory, countIdeasInCategory };
        // End: Xử lý data dành cho bar chart

        // Start: Xử lý data dành cho pie chart
        const nameDepartment = [];
        const totalIdeas = [];

        const totalIdeasOfDepartment = await Idea.getTotalIdeaOfDepartment();

        for (const totalIdea of totalIdeasOfDepartment) {
            nameDepartment.push(totalIdea.departmentName);
            totalIdeas.push(totalIdea.totalIdeas);
        }

        const pieChartData = { nameDepartment, totalIdeas };
        // End: Xử lý data dành cho pie chart

        // Start: Xử lý data dành cho line chart
        const lineChartData = await Idea.getCountIdeaByEachEvent();
        // End: Xử lý data dành cho line chart

        // Start: Kiểm tra số lượng của ideas, categories, departments, events
        const ideas = await Idea.Idea.find();
        const departments = await User.getAllDepartments();
        const events = await Event.getAllEvents();

        const countIdeas = ideas.length;
        const countCategories = categories.length;
        const countDepartments = departments.length;
        const countEvents = events.length;

        const count = { countIdeas, countCategories, countDepartments, countEvents };
        // End: Kiểm tra số lượng của ideas, categories, departments, events

        const data = { barChartData, pieChartData, lineChartData, count };

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    formCategoryView, submitFormCategory, listCategoriesView, updateCategoryView, updateFormCategory, deleteFormCategory, // Function: Category
    downloadZipDocs, exportIdeasToCsv,
    dashboardForQAM, checkData5s
};
