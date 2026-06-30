const Database = require('better-sqlite3');

const db = new Database('store.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS releases (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT,
    date TEXT,
    time TEXT,
    side_a TEXT,
    side_b TEXT,
    notes TEXT,
    sample_urls TEXT,
    download_url TEXT,
    images TEXT,
    physprice REAL NOT NULL,
    fileprice REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_urls TEXT DEFAULT '[]',
    audio_urls TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    release_id INTEGER NOT NULL,
    purchase_type TEXT NOT NULL,
    amount REAL NOT NULL,
    currency_code TEXT,
    paypal_order_id TEXT,
    capture_id TEXT,
    payer_email TEXT,
    payer_name TEXT,
    gross_amount REAL,
    paypal_fee REAL,
    net_amount REAL,
    shipping_address TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    captured_at TEXT,
    FOREIGN KEY (release_id) REFERENCES releases(id)
  );
`);

module.exports = db;
