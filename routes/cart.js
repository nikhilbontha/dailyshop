const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Add product to cart
router.post('/add', async (req, res) => {
  const productId = req.body.productId;
  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push(productId);
  res.redirect('/cart');
});

// View cart
router.get('/', async (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.render('cart', { products: [] });
  }
  const products = await Product.find({ _id: { $in: req.session.cart } });
  res.render('cart', { products });
});

module.exports = router;
