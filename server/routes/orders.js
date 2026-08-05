const express = require('express');
const db = require('../db');
const { BASE_URL, getAccessToken } = require('../paypal');

const router = express.Router();

router.get('/', (req, res) => {
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const orders = db.prepare(`
    SELECT orders.*, releases.title AS release_title
    FROM orders
    LEFT JOIN releases ON orders.release_id = releases.id
    ORDER BY orders.created_at DESC
  `).all();
  res.json(orders);
});

router.post('/', async (req, res) => {
  const release_id = req.body.release_id ?? req.body.releaseId;
  const purchase_type = req.body.purchase_type || 'physical';

  if (!release_id) {
    return res.status(400).json({ error: 'release_id is required' });
  }

  if (purchase_type !== 'physical' && purchase_type !== 'digital') {
    return res.status(400).json({ error: 'purchase_type must be physical or digital' });
  }

  const release = db.prepare('SELECT * FROM releases WHERE id = ?').get(release_id);
  if (!release) {
    return res.status(404).json({ error: 'Release not found' });
  }

  if (release.stock <= 0) {
    return res.status(400).json({ error: 'Sold out' });
  }

  const amount = purchase_type === 'physical' ? release.physprice : release.fileprice;

  try {
    const token = await getAccessToken();

    const ppRes = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
            custom_id: `${release_id}:${purchase_type}`,
            description: `${release.title} — ${purchase_type}`,
          },
        ],
        application_context: {
          return_url: `http://localhost:${process.env.PORT || 3001}/approved`,
          cancel_url: `http://localhost:${process.env.PORT || 3001}/cancelled`,
          shipping_preference: purchase_type === 'physical' ? 'GET_FROM_FILE' : 'NO_SHIPPING',
        },
      }),
    });

    const order = await ppRes.json();

    if (!ppRes.ok) {
      return res.status(502).json({ error: 'PayPal error', details: order });
    }

    const approveLink = order.links.find(l => l.rel === 'approve')?.href;

    res.json({ orderID: order.id, approveLink });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
