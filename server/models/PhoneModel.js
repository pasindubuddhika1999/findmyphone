const mongoose = require('mongoose');

const phoneModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PhoneBrand',
    required: true
  },
  image: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

// Create a compound index for brand+name to enforce uniqueness
phoneModelSchema.index({ brand: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('PhoneModel', phoneModelSchema); 