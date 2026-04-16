const { getDb } = require('../../config/database');

async function getAllUsers() {
  const db = getDb();
  return db('users')
    .select('id', 'name', 'email', 'role', 'created_at')
    .orderBy('created_at', 'desc');
}

async function getUserById(id) {
  const db   = getDb();
  const user = await db('users').where({ id }).select('id','name','email','role','created_at').first();

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return user;
}

async function updateUserRole(id, role) {
  const db   = getDb();
  const user = await db('users').where({ id }).first();

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  await db('users').where({ id }).update({ role, updated_at: new Date().toISOString() });
  return getUserById(id);
}

async function deleteUser(id, requesterId) {
  const db = getDb();

  if (id === requesterId) {
    const err = new Error('Admins cannot delete their own account.');
    err.statusCode = 400;
    throw err;
  }

  const user = await db('users').where({ id }).first();
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  // Tasks cascade-delete via FK
  await db('users').where({ id }).delete();
}

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
