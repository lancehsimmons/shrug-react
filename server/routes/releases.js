const express = require('express');
const db = require('../db');

const router = express.Router();

function parseRelease(row) {
  return {
    ...row,
    side_a: JSON.parse(row.side_a || '[]'),
    side_b: JSON.parse(row.side_b || '[]'),
    sample_urls: JSON.parse(row.sample_urls || '[]'),
    download_url: row.download_url || null,
    images: JSON.parse(row.images || '[]'),
  };
}

router.get('/', (req, res) => {
  const releases = db.prepare('SELECT * FROM releases ORDER BY id DESC').all().map(parseRelease);
  res.json(releases);
});

router.post('/', (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { title, artist, date, time, side_a, side_b, notes, sample_urls, images, physprice, fileprice, stock } = req.body;

  if (!title || physprice == null || fileprice == null) {
    return res.status(400).json({ error: 'title, physprice, and fileprice are required' });
  }

  const result = db.prepare(`
    INSERT INTO releases (title, artist, date, time, side_a, side_b, notes, sample_urls, images, physprice, fileprice, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    artist || null,
    date || null,
    time || null,
    JSON.stringify(side_a || []),
    JSON.stringify(side_b || []),
    notes || '',
    JSON.stringify(sample_urls || []),
    JSON.stringify(images || []),
    physprice,
    fileprice,
    stock ?? 0
  );

  const release = db.prepare('SELECT * FROM releases WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(parseRelease(release));
});

module.exports = router;
