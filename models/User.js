const mongoose = require("mongoose");

// Start: Define our role schema
const roleSchema = new mongoose.Schema({
  name: { type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Role = mongoose.model('Role', roleSchema);
// End: Define our role schema

// Start: Define our Department schema
const departmentSchema = new mongoose.Schema({
  name: { type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Department = mongoose.model('Department', departmentSchema);
// End: Define our Department schema

// Start: Define our user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    maxLength: 50
  },
  password: {
    type: String,
    required: true,
    maxLength: 50
  },
  fullName: {
    type: String,
    required: true,
    maxLength: 50
  },
  dob: Date,
  email: {
    type: String,
    required: false,
    maxLength: 50
  },
  phone: {
    type: String,
    required: false,
    maxLength: 50
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  department:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }
});

const User = mongoose.model('User', userSchema);
// End: Define our user schema

/**
 *  Function: Thêm 1 tài khoản
 */
function insertUser(data) {
  User.create(data);
}

/**
 *  Function Lấy toàn bộ thông tin các Roles
 */
async function getAllRoles() {
  // Sử dụng phương thức find để lấy tất cả các documents từ bảng users
  const roles = await Role.find();
  return roles;
}

/**
 * Function: Lấy toàn bộ thông tin các Users dựa vào tên Role
 */
async function getAccountsByRoleName(roleName) {
  try {
    const role = await Role.findOne({ name: roleName });
    const users = await User.find({ role: role._id }).populate('role');
    return users;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Export the Mongoose model
module.exports = { User, Role, Department, insertUser, getAllRoles, getAccountsByRoleName };

