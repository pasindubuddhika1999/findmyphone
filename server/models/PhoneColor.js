const mongoose = require('mongoose');

const phoneColorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  phoneModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PhoneModel',
    required: true
  },
  hexCode: {
    type: String,
    trim: true,
    maxlength: 7
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

// Create a compound index for model+color to enforce uniqueness
phoneColorSchema.index({ phoneModel: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('PhoneColor', phoneColorSchema); 