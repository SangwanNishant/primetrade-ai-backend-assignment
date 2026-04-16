const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../../config/database');
const { signToken } = require('../../utils/jwt');

const SALT_ROUNDS = 12;

async function register({ name, email, password }) {
  const db = getDb();

  const existing = await db('users').where({ email: email.toLowerCase() }).first();
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  const id            = uuidv4();
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  await db('users').insert({
    id,
    name:          name.trim(),
    email:         email.toLowerCase(),
    password_hash,
    role:          'user',
  });

  const user  = await db('users').where({ id }).select('id','name','email','role','created_at').first();
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return { user, token };
}

async function login({ email, password }) {
  const db = getDb();

  const user = await db('users').where({ email: email.toLowerCase() }).first();

  // Constant-time comparison to prevent timing attacks
  const isValid = user ? await bcrypt.compare(password, user.password_hash) : false;

  if (!user || !isValid) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

async function getMe(userId) {
  const db   = getDb();
  const user = await db('users').where({ id: userId }).select('id','name','email','role','created_at').first();

  if (!user) {
    const err = new Error('User account not found.');
    err.statusCode = 404;
    throw err;
  }

  return user;
}

module.exports = { register, login, getMe };
