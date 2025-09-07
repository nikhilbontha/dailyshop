const express = require('express');
const router = express.Router();


const Order = require('../models/Order');
const Product = require('../models/product');


// Returns & Cancel page
router.get('/', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  // Find user's orders
  const orders = await Order.find({ userId: req.session.user._id }).populate('items.productId');
  // Flatten all items from all orders, guard against deleted products
  const items = orders.flatMap(order => order.items.map(item => {
    if (!item.productId) {
      return { id: null, name: 'Product removed' };
    }
    return { id: item.productId._id, name: item.productId.name };
  }));
  res.render('returns', { items });
});

module.exports = router;
