const express = require('express');
const router = express.Router();
const db = require('../db');

function parsePost(row) {
  return {
    ...row,
    image_urls: JSON.parse(row.image_urls || '[]'),
    audio_urls: JSON.parse(row.audio_urls || '[]'),
  };
}

router.get('/', (req, res) => {
  const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  res.json(posts.map(parsePost));
});

router.post('/', (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { title, body, image_urls, audio_urls } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }

  const result = db.prepare(`
    INSERT INTO posts (title, body, image_urls, audio_urls)
    VALUES (?, ?, ?, ?)
  `).run(
    title,
    body,
    JSON.stringify(image_urls || []),
    JSON.stringify(audio_urls || [])
  );

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(parsePost(post));
});

module.exports = router;
