const Razorpay = require('../config/payment');
const Order = require('../models/Order');
const User = require('../models/User');

const Product = require('../models/product');
exports.checkoutPage = async (req, res) => {
  if (!req.session || !req.session.cart || req.session.cart.length === 0) {
    return res.redirect('/cart');
  }
  const products = await Product.find({ _id: { $in: req.session.cart } });
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  res.render('checkout', { products, totalPrice });
};

exports.createOrder = async (req, res) => {
  const { paymentMethod } = req.body;
  if (!req.session || !req.session.cart || req.session.cart.length === 0) {
    return res.status(400).send('Cart not found. Please add items to your cart.');
  }
  const products = await Product.find({ _id: { $in: req.session.cart } });
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  if (paymentMethod === 'cash') {
    try {
      const order = new Order({
        userId: req.session.user ? req.session.user._id : null,
        items: products.map(p => ({ productId: p._id, quantity: 1 })),
        totalPrice,
        paymentMethod: 'Cash',
        paymentStatus: 'Pending',
        createdAt: new Date()
      });
      await order.save();
      // Debug: print active DB name and collections
      const db = require('mongoose').connection.db;
      db.listCollections().toArray((err, collections) => {
        if (err) {
          console.error('Error listing collections:', err);
        } else {
          console.log('Active DB:', db.databaseName);
          console.log('Collections:', collections.map(c => c.name));
        }
      });
      console.log('Order saved:', order);
      req.session.cart = [];
      return res.redirect(`/order/${order._id}`);
    } catch (err) {
      console.error('Error saving order:', err);
      return res.status(500).send('Error saving order');
    }
  }
  const options = {
    amount: totalPrice * 100,
    currency: 'INR',
    receipt: `order_rcptid_${Date.now()}`,
  };
  const razorpayOrder = await Razorpay.orders.create(options);
  res.render('payment', { razorpayOrder, totalPrice, paymentMethod });
};
