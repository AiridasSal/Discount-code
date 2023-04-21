const mongoose = require('mongoose');
const crypto = require('crypto');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  addedAt: { type: Date, default: Date.now },
  discountCode: { type: String },
  discountUsed: { type: Boolean, default: false },
  discountedOrder: { type: String, default: '' },
  discountLink: { type: String, unique: true }
});

subscriberSchema.pre('save', function (next) {
  if (!this.discountLink) {
    this.discountLink = crypto.randomBytes(16).toString('hex');
  }
  next();
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
