require('dotenv').config();
const { getDb } = require('../config/database');

async function migrate() {
  const db = getDb();

  // Users table
  const hasUsers = await db.schema.hasTable('users');
  if (!hasUsers) {
    await db.schema.createTable('users', (t) => {
      t.string('id').primary();
      t.string('name', 100).notNullable();
      t.string('email', 255).notNullable().unique();
      t.text('password_hash').notNullable();
      t.enum('role', ['user', 'admin']).notNullable().defaultTo('user');
      t.timestamp('created_at').defaultTo(db.fn.now());
      t.timestamp('updated_at').defaultTo(db.fn.now());
    });
    console.log('✅ Created table: users');
  } else {
    console.log('ℹ️  Table "users" already exists.');
  }

  // Tasks table
  const hasTasks = await db.schema.hasTable('tasks');
  if (!hasTasks) {
    await db.schema.createTable('tasks', (t) => {
      t.string('id').primary();
      t.string('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.string('title', 200).notNullable();
      t.text('description').defaultTo('');
      t.enum('status', ['todo', 'in_progress', 'done']).notNullable().defaultTo('todo');
      t.enum('priority', ['low', 'medium', 'high']).notNullable().defaultTo('medium');
      t.string('due_date').nullable();
      t.timestamp('created_at').defaultTo(db.fn.now());
      t.timestamp('updated_at').defaultTo(db.fn.now());
    });
    console.log('✅ Created table: tasks');
  } else {
    console.log('ℹ️  Table "tasks" already exists.');
  }

  console.log('✅ Migration complete.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
