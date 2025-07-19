const mongoose = require('mongoose');

const phoneBrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    maxlength: 50
  },
  logo: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('PhoneBrand', phoneBrandSchema); 