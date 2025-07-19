const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shop', shopSchema); 