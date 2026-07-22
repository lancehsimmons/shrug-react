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
  const releases = db.prepare(`SELECT * FROM releases WHERE status = 'published' ORDER BY id DESC`).all().map(parseRelease);
  res.json(releases);
});

router.get('/all', (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const releases = db.prepare('SELECT * FROM releases ORDER BY id DESC').all().map(parseRelease);
  res.json(releases);
});

router.post('/:id/publish', (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  db.prepare(`UPDATE releases SET status = 'published' WHERE id = ?`).run(req.params.id);
  res.json(parseRelease(db.prepare('SELECT * FROM releases WHERE id = ?').get(req.params.id)));
});

router.post('/:id/unpublish', (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  db.prepare(`UPDATE releases SET status = 'draft' WHERE id = ?`).run(req.params.id);
  res.json(parseRelease(db.prepare('SELECT * FROM releases WHERE id = ?').get(req.params.id)));
});

router.post('/', (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { title, artist, date, time, side_a, side_b, notes, sample_urls, images, physprice, fileprice, stock } = req.body;

  if (!title || fileprice == null) {
    return res.status(400).json({ error: 'title and fileprice are required' });
  }

  const result = db.prepare(`
    INSERT INTO releases (title, artist, date, time, side_a, side_b, notes, sample_urls, images, physprice, fileprice, stock, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    physprice ?? null,
    fileprice,
    stock ?? 0,
    'draft'
  );

  const release = db.prepare('SELECT * FROM releases WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(parseRelease(release));
});

router.put('/:id', (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const release = db.prepare('SELECT * FROM releases WHERE id = ?').get(req.params.id);
  if (!release) return res.status(404).json({ error: 'Not found' });

  const { title, artist, date, time, side_a, side_b, notes, sample_urls, images, physprice, fileprice, stock, download_url } = req.body;

  if (!title || fileprice == null) {
    return res.status(400).json({ error: 'title and fileprice are required' });
  }

  db.prepare(`
    UPDATE releases
    SET title = ?, artist = ?, date = ?, time = ?, side_a = ?, side_b = ?, notes = ?, sample_urls = ?, images = ?, physprice = ?, fileprice = ?, stock = ?, download_url = ?
    WHERE id = ?
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
    physprice ?? null,
    fileprice,
    stock ?? 0,
    download_url || null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM releases WHERE id = ?').get(req.params.id);
  res.json(parseRelease(updated));
});

module.exports = router;
