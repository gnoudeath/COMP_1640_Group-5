const mongoose = require("mongoose");
// Category Model
const categorySchema = new mongoose.Schema({
    name: String, // String is shorthand for {type: String}
    
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
module.exports = {Idea,Category}