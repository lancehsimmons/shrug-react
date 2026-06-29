const express = require('express');
const { randomUUID } = require('crypto');
const db = require('../db');
const { BASE_URL, getAccessToken } = require('../paypal');

const router = express.Router({ mergeParams: true });

router.post('/', async (req, res) => {
  const { orderID } = req.params;

  try {
    const token = await getAccessToken();

    const ppRes = await fetch(`${BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const order = await ppRes.json();

    if (!ppRes.ok) {
      return res.status(502).json({ error: 'PayPal capture failed', details: order });
    }

    const capture = order.purchase_units[0].payments.captures[0];
    const payer = order.payer;
    const breakdown = capture.seller_receivable_breakdown;

    const [release_id, purchase_type] = capture.custom_id.split(':');

    const update = db.prepare(
      'UPDATE releases SET stock = stock - 1 WHERE id = ? AND stock > 0'
    ).run(release_id);

    if (update.changes === 0) {
      return res.status(409).json({ error: 'Sold out — stock was exhausted before capture completed' });
    }

    const record = db.prepare(`
      INSERT INTO orders (
        id, release_id, purchase_type, amount, currency_code,
        paypal_order_id, capture_id, payer_email, payer_name,
        gross_amount, paypal_fee, net_amount,
        shipping_address, status, captured_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
    `).run(
      randomUUID(),
      Number(release_id),
      purchase_type,
      Number(capture.amount.value),
      capture.amount.currency_code,
      order.id,
      capture.id,
      payer.email_address,
      `${payer.name.given_name} ${payer.name.surname}`,
      breakdown ? Number(breakdown.gross_amount.value) : null,
      breakdown ? Number(breakdown.paypal_fee.value) : null,
      breakdown ? Number(breakdown.net_amount.value) : null,
      order.purchase_units[0].shipping
        ? JSON.stringify(order.purchase_units[0].shipping.address)
        : null,
      capture.create_time
    );

    const saved = db.prepare('SELECT * FROM orders WHERE id = ?').get(
      db.prepare('SELECT id FROM orders WHERE paypal_order_id = ?').get(order.id).id
    );

    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
