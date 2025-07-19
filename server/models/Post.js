const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  imei: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    minlength: 15,
    maxlength: 15,
    match: /^\d{15}$/
  },
  phoneModel: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  color: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  town: {
    type: String,
    required: true,
    trim: true
  },
  lostLocation: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  lostDate: {
    type: Date,
    required: true
  },
  contactInfo: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String
    }
  }],
  status: {
    type: String,
    enum: ['active', 'resolved', 'deleted'],
    default: 'active'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByShop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    default: null
  },
  isShopCreated: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: true
});

// Index for search functionality
postSchema.index({ 
  imei: 1, 
  phoneModel: 1, 
  brand: 1, 
  lostLocation: 1,
  status: 1 
});

// Text search index
postSchema.index({
  title: 'text',
  description: 'text',
  phoneModel: 'text',
  brand: 'text',
  lostLocation: 'text'
});

// Virtual for formatted lost date
postSchema.virtual('formattedLostDate').get(function() {
  return this.lostDate.toLocaleDateString();
});

// Ensure virtuals are serialized
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema); 