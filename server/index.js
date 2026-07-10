require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./db');
require('./seed');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => res.send('ok'));

app.use('/api/releases', require('./routes/releases'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/orders/:orderID/capture', require('./routes/capture'));
app.use('/api/posts', require('./routes/posts'));

app.listen(4000, () => console.log('Server running on http://localhost:4000'));
