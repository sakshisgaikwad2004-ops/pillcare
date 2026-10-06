// db.js - SQLite database initialisation using Node.js built-in node:sqlite
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'pillcare.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high concurrency & reliability
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      composition TEXT,
      strength TEXT,
      price REAL NOT NULL,
      stockStatus TEXT DEFAULT 'In Stock',
      prescriptionRequired INTEGER DEFAULT 0,
      packSize TEXT,
      description TEXT,
      dosageInstructions TEXT,
      isFeatured INTEGER DEFAULT 0,
      imageUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referenceCode TEXT UNIQUE NOT NULL,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      customerEmail TEXT,
      preference TEXT DEFAULT 'Counter Pickup',
      notes TEXT,
      itemsJson TEXT NOT NULL,
      prescriptionFile TEXT,
      status TEXT DEFAULT 'Pending',
      adminNotes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Seed initial products if table is empty
function seedProducts() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (countRow.count === 0) {
    const seedPath = path.join(__dirname, '..', 'data', 'medicines.seed.json');
    if (fs.existsSync(seedPath)) {
      const items = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      const insert = db.prepare(`
        INSERT INTO products (
          name, brand, category, composition, strength, price,
          stockStatus, prescriptionRequired, packSize, description,
          dosageInstructions, isFeatured, imageUrl
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      for (const item of items) {
        insert.run(
          item.name,
          item.brand,
          item.category,
          item.composition || '',
          item.strength || '',
          item.price,
          item.stockStatus || 'In Stock',
          item.prescriptionRequired ? 1 : 0,
          item.packSize || '',
          item.description || '',
          item.dosageInstructions || '',
          item.isFeatured ? 1 : 0,
          item.imageUrl || ''
        );
      }
      console.log(`[DB] Successfully seeded ${items.length} medicines into database.`);
    }
  }
}

// Seed initial store config if empty
function seedStoreConfig() {
  const configPath = path.join(__dirname, '..', 'config', 'store.config.json');
  if (fs.existsSync(configPath)) {
    const existing = db.prepare('SELECT value FROM store_settings WHERE key = ?').get('store_config');
    if (!existing) {
      const configStr = fs.readFileSync(configPath, 'utf8');
      db.prepare('INSERT INTO store_settings (key, value) VALUES (?, ?)').run('store_config', configStr);
      console.log('[DB] Initial store config seeded into database.');
    }
  }
}

initSchema();
seedProducts();
seedStoreConfig();

module.exports = {
  db,
  initSchema
};
