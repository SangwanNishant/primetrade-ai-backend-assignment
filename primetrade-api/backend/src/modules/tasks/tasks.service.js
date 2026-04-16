const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../../config/database');

async function getTasks(userId, role, filters = {}) {
  const db = getDb();

  let query = db('tasks as t')
    .join('users as u', 't.user_id', 'u.id')
    .select(
      't.*',
      'u.name as user_name',
      'u.email as user_email'
    )
    .orderBy('t.created_at', 'desc');

  if (role !== 'admin') {
    query = query.where('t.user_id', userId);
  }

  if (filters.status)   query = query.where('t.status', filters.status);
  if (filters.priority) query = query.where('t.priority', filters.priority);
  if (filters.search) {
    const term = `%${filters.search}%`;
    query = query.where((q) => {
      q.whereLike('t.title', term).orWhereLike('t.description', term);
    });
  }

  return query;
}

async function getTaskById(id, userId, role) {
  const db   = getDb();
  const task = await db('tasks').where({ id }).first();

  if (!task) {
    const err = new Error('Task not found.');
    err.statusCode = 404;
    throw err;
  }

  if (role !== 'admin' && task.user_id !== userId) {
    const err = new Error('Access denied. You do not own this task.');
    err.statusCode = 403;
    throw err;
  }

  return task;
}

async function createTask(userId, data) {
  const db = getDb();
  const id = uuidv4();

  await db('tasks').insert({
    id,
    user_id:     userId,
    title:       data.title,
    description: data.description || '',
    status:      data.status      || 'todo',
    priority:    data.priority    || 'medium',
    due_date:    data.due_date    || null,
  });

  return db('tasks').where({ id }).first();
}

async function updateTask(id, userId, role, data) {
  const db   = getDb();
  const task = await db('tasks').where({ id }).first();

  if (!task) {
    const err = new Error('Task not found.');
    err.statusCode = 404;
    throw err;
  }

  if (role !== 'admin' && task.user_id !== userId) {
    const err = new Error('Access denied. You do not own this task.');
    err.statusCode = 403;
    throw err;
  }

  const updates = { updated_at: new Date().toISOString() };
  if (data.title       !== undefined) updates.title       = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.status      !== undefined) updates.status      = data.status;
  if (data.priority    !== undefined) updates.priority    = data.priority;
  if (data.due_date    !== undefined) updates.due_date    = data.due_date;

  await db('tasks').where({ id }).update(updates);
  return db('tasks').where({ id }).first();
}

async function deleteTask(id, userId, role) {
  const db   = getDb();
  const task = await db('tasks').where({ id }).first();

  if (!task) {
    const err = new Error('Task not found.');
    err.statusCode = 404;
    throw err;
  }

  if (role !== 'admin' && task.user_id !== userId) {
    const err = new Error('Access denied. You do not own this task.');
    err.statusCode = 403;
    throw err;
  }

  await db('tasks').where({ id }).delete();
  return { deleted: true };
}

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
