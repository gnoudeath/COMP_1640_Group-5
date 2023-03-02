const mongoose = require("mongoose");
// Category Model
const categorySchema = new mongoose.Schema({
  nameCate: String, // String is shorthand for {type: String}
  describe: String,
});


const Category = mongoose.model('Category', categorySchema);

// Idea 
const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now()
  },
  closedDate: {
    type: Date,
    default: null
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Idea = mongoose.model('Idea', ideaSchema);


// Upload file
const uploadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  files: {
    type: Buffer,
    require: true,

  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ideas: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: true
  }
});

const File = mongoose.model('Upload', uploadSchema);

/**
 * Function: Lấy tất cả categories
 */
async function getAllCategorys() {
  const categorys = await Category.find();
  return categorys;
}

/**
 *  Function: Thêm 1 category
 */
function insertCategory(data) {
  Category.create(data);
}

/**
 * Function: Lấy dữ liệu của 1 category bằng id
 */
async function getCategoryByID(id) {
  try {
    const category = await Category.findOne({ _id: id });
    return category;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Function: Cập nhật category
 */
async function updateCategory(id, data) {
  await Category.findByIdAndUpdate(id, data);
}

/**
 * Function: Xóa Category
 */
async function deleteCategory(id) {
  await Category.findByIdAndRemove(id);
}

module.exports = {
  Idea, Category, File,
  getAllCategorys, insertCategory, getCategoryByID, updateCategory, deleteCategory,     // Function: Category
}