const knex = require('knex');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'primetrade.db');

let _db = null;

/**
 * Returns the singleton knex instance connected to SQLite.
 * Using knex allows swapping to PostgreSQL/MySQL by just changing the client config.
 */
function getDb() {
  if (!_db) {
    _db = knex({
      client: 'sqlite3',
      connection: { filename: DB_PATH },
      useNullAsDefault: true, // SQLite doesn't support DEFAULT for all types
      pool: {
        min: 0,
        max: 1,                     // SQLite is single-writer
        afterCreate: (conn, cb) => {
          // Enable WAL mode and FK enforcement
          conn.run('PRAGMA journal_mode = WAL;', () => {
            conn.run('PRAGMA foreign_keys = ON;', cb);
          });
        },
      },
    });
    console.log(`📦 SQLite connected: ${DB_PATH}`);
  }
  return _db;
}

async function closeDb() {
  if (_db) {
    await _db.destroy();
    _db = null;
  }
}

module.exports = { getDb, closeDb };
