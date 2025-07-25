const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
  },
  buttonLink: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
BannerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Banner", BannerSchema);
