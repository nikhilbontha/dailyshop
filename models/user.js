const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  avatarUrl: String,
  phone: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: {
    city: String,
    pincode: String,
    nearby: String,
    state: String,
    country: String,
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
