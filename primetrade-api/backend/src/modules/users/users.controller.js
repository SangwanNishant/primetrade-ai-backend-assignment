const usersService = require('./users.service');
const { success } = require('../../utils/response');

async function getAllUsers(req, res, next) {
  try {
    const users = await usersService.getAllUsers();
    return success(res, { users, count: users.length }, 'Users retrieved.');
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await usersService.getUserById(req.params.id);
    return success(res, { user }, 'User retrieved.');
  } catch (err) {
    next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'user' or 'admin'." });
    }

    const user = await usersService.updateUserRole(req.params.id, role);
    return success(res, { user }, 'User role updated.');
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    await usersService.deleteUser(req.params.id, req.user.id);
    return success(res, null, 'User deleted successfully.');
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
