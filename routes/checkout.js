const express = require('express');
const router = express.Router();

const Product = require('../models/product');
router.get('/checkout', async (req, res) => {
  if (!req.session || !req.session.cart || req.session.cart.length === 0) {
    return res.redirect('/cart');
  }
  // Fetch products in cart and calculate total price
  const products = await Product.find({ _id: { $in: req.session.cart } });
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  res.render('checkout', { totalPrice });
});

module.exports = router;