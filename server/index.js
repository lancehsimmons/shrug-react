require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./db');
require('./seed');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/releases', require('./routes/releases'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/orders/:orderID/capture', require('./routes/capture'));
app.use('/api/posts', require('./routes/posts'));

app.listen(4000, () => console.log('Server running on http://localhost:4000'));
