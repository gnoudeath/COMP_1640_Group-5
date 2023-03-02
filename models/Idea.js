const mongoose = require("mongoose");
// Category Model
const categorySchema = new mongoose.Schema({
    nameCate: String, // String is shorthand for {type: String}
    
  });

  async function getAllCategorys() {
    const categorys = await Category.find();
    return categorys;
  }
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

const Idea = mongoose.model('Idea', ideaSchema);
const File = mongoose.model('Upload', uploadSchema);

module.exports = {Idea,Category,File,getAllCategorys}