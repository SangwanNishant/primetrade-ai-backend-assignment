require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');

const SALT_ROUNDS = 12;

async function seed() {
  const db = getDb();

  // ─── Admin User ────────────────────────────────────────────────────────────
  const existingAdmin = await db('users').where({ email: 'admin@primetrade.ai' }).first();

  let demoId;

  if (!existingAdmin) {
    const adminId   = uuidv4();
    const adminHash = await bcrypt.hash('Admin@123!', SALT_ROUNDS);
    await db('users').insert({
      id: adminId, name: 'Admin User',
      email: 'admin@primetrade.ai', password_hash: adminHash, role: 'admin',
    });
    console.log('✅ Admin created: admin@primetrade.ai / Admin@123!');
  } else {
    console.log('ℹ️  Admin already exists, skipping.');
  }

  // ─── Demo User ─────────────────────────────────────────────────────────────
  const existingDemo = await db('users').where({ email: 'demo@primetrade.ai' }).first();

  if (!existingDemo) {
    demoId = uuidv4();
    const demoHash = await bcrypt.hash('User@123!', SALT_ROUNDS);
    await db('users').insert({
      id: demoId, name: 'Demo User',
      email: 'demo@primetrade.ai', password_hash: demoHash, role: 'user',
    });
    console.log('✅ Demo user created: demo@primetrade.ai / User@123!');
  } else {
    demoId = existingDemo.id;
    console.log('ℹ️  Demo user already exists, skipping.');
  }

  // ─── Demo Tasks ────────────────────────────────────────────────────────────
  const taskCount = await db('tasks').where({ user_id: demoId }).count('id as c').first();

  if (parseInt(taskCount.c) === 0) {
    const demoBatch = [
      { id: uuidv4(), user_id: demoId, title: 'Set up project architecture',       description: 'Design and implement the base modular project structure', status: 'done',        priority: 'high',   due_date: null },
      { id: uuidv4(), user_id: demoId, title: 'Implement JWT authentication',      description: 'Build secure login/register endpoints with bcrypt hashing',   status: 'done',        priority: 'high',   due_date: null },
      { id: uuidv4(), user_id: demoId, title: 'Write Swagger documentation',       description: 'Document all endpoints with OpenAPI 3.0 spec',               status: 'in_progress', priority: 'medium', due_date: '2024-02-01' },
      { id: uuidv4(), user_id: demoId, title: 'Add unit and integration tests',    description: 'Write Jest tests for auth and CRUD task endpoints',           status: 'todo',        priority: 'medium', due_date: null },
      { id: uuidv4(), user_id: demoId, title: 'Configure Docker deployment',       description: 'Write Dockerfile and docker-compose for containerized setup', status: 'todo',        priority: 'low',    due_date: null },
      { id: uuidv4(), user_id: demoId, title: 'Implement Redis caching',           description: 'Cache GET /tasks with TTL-based key invalidation on writes',  status: 'todo',        priority: 'low',    due_date: null },
    ];
    await db('tasks').insert(demoBatch);
    console.log('✅ Demo tasks seeded.');
  }

  console.log('\n🚀 All done! Run `npm run dev` to start the server.\n');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
