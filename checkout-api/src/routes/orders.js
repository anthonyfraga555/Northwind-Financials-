const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const _ = require('lodash');
const Stripe = require('stripe');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'unauthorized' });
  }
}

router.post('/', auth, async (req, res) => {
  const items = _.get(req.body, 'items', []);
  const amount = _.sumBy(items, (i) => i.price * i.quantity);
  const intent = await stripe.paymentIntents.create({ amount, currency: 'usd' });
  res.status(201).json({ id: uuid(), amount, clientSecret: intent.client_secret });
});

module.exports = router;
