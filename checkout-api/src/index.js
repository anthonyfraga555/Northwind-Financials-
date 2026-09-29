require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger');
const orders = require('./routes/orders');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/orders', orders);

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`checkout-api listening on ${port}`));
