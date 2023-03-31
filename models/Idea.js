const mongoose = require("mongoose");
const Event = require('../models/Event');

// Category Model
const categorySchema = new mongoose.Schema({
  nameCate: String, // String is shorthand for {type: String}
  describe: String,
});


const Category = mongoose.model('Category', categorySchema);

// Idea Model
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  uploads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload'
  }],
  hashtags: [{
    type: String,
    
  }]
});

const Idea = mongoose.model('Idea', ideaSchema);


const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now()
  },
  updated_at: {
    type: Date,
    default: null
  },
  idea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  anonymous: {
    type: Boolean,
    default: false
  }
});

const CommentModel = mongoose.model('Comment', commentSchema, "comments");

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

async function getCountIdeaRecordsByCategoryName(categoryID) {
  const count = await Idea.countDocuments({ category: categoryID });
  return count;
}

/**
 * Function: Xóa Category
 */
async function deleteCategory(id) {
  await Category.findByIdAndRemove(id);
}

/**
 * Function: Lấy tổng Idea của mỗi Department
 */
async function getTotalIdeaOfDepartment() {
  const data = await Idea.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $lookup: {
        from: 'departments',
        localField: 'user.department',
        foreignField: '_id',
        as: 'department'
      }
    },
    {
      $unwind: '$department'
    },
    {
      $group: {
        _id: '$department._id',
        departmentName: { $first: '$department.name' },
        totalIdeas: { $sum: 1 }
      }
    }
  ]);
  return data;
}

/**
 * Function: Lấy số lượng Idea của mỗi Event
 */
async function getCountIdeaByEachEvent() {
  const ideas = await Idea.find().populate('user');
  const events = await Event.Event.find();

  const eventIdeaCounts = {};
  ideas.forEach(idea => {
    // duyệt qua danh sách các Idea và tìm Event tương ứng với mỗi Idea bằng cách kiểm tra xem createdDate của Idea có nằm trong khoảng startDate và finalClosureDate của một Event nào đó hay không
    const event = events.find(event => idea.createdDate >= event.startDate && idea.createdDate <= event.finalClosureDate);

    // Nếu có thì tăng biến đếm eventIdeaCounts[event._id] lên 1.
    if (event) {
      if (!eventIdeaCounts[event._id]) {
        eventIdeaCounts[event._id] = 0;
      }
      eventIdeaCounts[event._id]++;
    }
  });

  const labels = events.map(event => event.name);
  const value = events.map(event => eventIdeaCounts[event._id] || 0);

  const data = { labels, value };
  return data;
}

/**
 * Function: Kiểm tra người dùng này có sở hữu Idea nào không
 */
async function checkUserOwnsIdeas(user_ID) {
  const ideas = await Idea.find({ user: user_ID });
  if (ideas.length > 0) {
    return false;
  }
  else {
    return true;
  }
}

/**
 * Function: Kiểm tra category này có Ideas nào không
 */
async function checkCategoryHasIdeas(category_ID) {
  const ideas = await Idea.find({ category: category_ID });
  if (ideas.length > 0) {
    return false;
  }
  else {
    return true;
  }
}

module.exports = {
  Idea, Category, File, CommentModel,
  getAllCategorys, insertCategory, getCategoryByID, updateCategory, deleteCategory,
  getCountIdeaRecordsByCategoryName, getTotalIdeaOfDepartment, getCountIdeaByEachEvent,
  checkUserOwnsIdeas, checkCategoryHasIdeas
}