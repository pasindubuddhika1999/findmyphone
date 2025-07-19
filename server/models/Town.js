const mongoose = require('mongoose');

const townSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure town names are unique per district
townSchema.index({ name: 1, district: 1 }, { unique: true });

module.exports = mongoose.model('Town', townSchema); 