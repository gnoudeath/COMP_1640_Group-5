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
  describe: { type: String },
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
 *  Function: Insert 1 User
 */
function insertUser(data) {
  User.create(data);
}

/**
 *  Function: Get all information about Roles
 */
async function getAllRoles() {
  // Use find method to get all documents from "users" table
  const roles = await Role.find();
  return roles;
}

/**
 * Function: Get all infomation of Users based on Role name
 */
async function getAccountsByRoleName(roleName) {
  try {
    const role = await Role.findOne({ name: roleName });
    const users = await User.find({ role: role._id }).populate(['role', 'department']);
    return users;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Function: Lấy toàn bộ thông tin các Users dựa vào tên Role
 */
async function getAccountsByRoleNameAndDepartmentName(roleName, departmentName) {
  try {
    const role = await Role.findOne({ name: roleName });
    const department = await Department.findOne({ name: departmentName });

    const users = await User.find({ role: role._id, department: department._id }).populate(['role', 'department']);
    return users;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Function: Get data of 1 user by User_ID
 */
async function getAccountByID(user_id) {
  try {
    const user = await User.findOne({ _id: user_id }).populate(['role', 'department']);

    const convertedData = {
      ...user._doc,
      dob: user.dob.toISOString().slice(0, 10),
    };

    return convertedData;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Function: Update Account
 */
async function updateAccount(id, data) {
  await User.findByIdAndUpdate(id, data);
}

/**
 * Function: Xóa tài khoản
 */
async function deleteAccount(id) {
  await User.findByIdAndRemove(id);
}

/**
 * Function: Check if this department has any accounts
 */
async function checkAccountExistsInDepartment(department_ID) {
  const accounts = await User.find({ department: department_ID });
  if (accounts.length > 0) {
    return false;
  }
  else {
    return true;
  }
}

/**
 * Function: Check the account exists by checking username
 */
async function checkAccountExists(username) {
  const account = await User.find({ username: username });
  if (account.length == 1) {
    return true;
  }
  else {
    return false;
  }
}

/**
 *  Function: Insert Department
 */
function insertDepartment(data) {
  Department.create(data);
}

/**
 * Function: Get all information about Departments
 */
async function getAllDepartments() {
  // Use find method to get all documents from "departments" table
  const departments = await Department.find();
  return departments;
}

/**
 * Function: Get data of department by ID
 */
async function getDepartmentByID(id) {
  try {
    const department = await Department.findOne({ _id: id });
    return department;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Function: Update department
 */
async function updateDepartment(id, data) {
  await Department.findByIdAndUpdate(id, data);
}

/**
 * Function: Delete Department
 */
async function deleteDepartment(id) {
  await Department.findByIdAndRemove(id);
}


// Export the Mongoose model
module.exports = {
  User, Role, Department,
  getAllRoles, getAccountsByRoleNameAndDepartmentName,
  insertUser, getAccountsByRoleName, getAccountByID, updateAccount, deleteAccount, checkAccountExists,
  insertDepartment, getAllDepartments, getDepartmentByID, updateDepartment, deleteDepartment, checkAccountExistsInDepartment
};

