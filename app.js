require('dotenv').config();
require('./config/db'); // MongoDB connection initialization

// Temporary: capture uncaught exceptions and unhandled promise rejections to aid debugging
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION -', err && err.stack ? err.stack : err);
  // do not exit immediately to allow log flush
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason && reason.stack ? reason.stack : reason);
});

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// Security and performance middlewares
app.use(helmet());
app.use(cors()); // Configure origins properly in production

app.use(express.json({ limit: '10kb' }));
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
});
app.use(limiter);

// Body parsers
app.use(express.urlencoded({ extended: true }));

// Session setup - must be before route access to req.session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Static files
app.use(express.static('public'));

// Middleware to make user, cartCount, and location available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
  res.locals.location = req.session.user ? req.session.user.location : null;
  next();
});

// Set EJS as view engine
app.set('view engine', 'ejs');

// Route imports and mount
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
app.use('/', require('./routes/home'));
app.use('/category', require('./routes/category'));
app.use('/search', require('./routes/search'));
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/', require('./routes/profile'));
app.use('/api/payment', require('./routes/payment'));
app.use('/returns', require('./routes/returns'));
app.use('/reviews', require('./routes/reviews'));
app.use('/wishlist', require('./routes/wishlist'));
app.use('/change-password', require('./routes/change-password'));
app.use('/payment', require('./routes/payment'));


// Dedicated route for /auth/account page
app.get('/auth/account', (req, res) => {
  res.render('auth/account', { user: req.session.user || null });
});

// Checkout route
const Product = require('./models/product');
app.get('/checkout', async (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.redirect('/cart');
  }
  // Fetch products in cart and calculate total price
  const products = await Product.find({ _id: { $in: req.session.cart } });
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  res.render('checkout', { cart: req.session.cart, user: req.session.user, totalPrice });
});

// Ensure /profile route is complete
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  res.render('profile', { user: req.session.user });
});

// Home route example passing location etc (if needed in addition to middleware)
app.get('/', (req, res) => {
  res.render('home', {
    user: req.session.user,
    location: req.session.user ? req.session.user.location : null,
    cartCount: req.session.cart ? req.session.cart.length : 0,
  });
});

// Global error handler
function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

const orderRouter = require('./routes/order');
app.use('/', orderRouter);
const User = require('./models/User'); // Ensure User model is imported


app.get('/category/:name', async (req, res) => {
  const categoryName = req.params.name.toLowerCase();
  const products = await Product.find({ category: categoryName });
  res.render('categories/products', { products, categoryName });
});

// Ensure auth routes are complete
const bcrypt = require('bcrypt');
const router = express.Router();

// Render Registration Page
router.get('/register', (req, res) => {
  res.render('auth/register', { error: null });
});

const checkoutRouter = require('./routes/checkout');
app.use('/', checkoutRouter);
