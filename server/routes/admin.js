const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Post = require('../models/Post');
const PhoneBrand = require('../models/PhoneBrand');
const PhoneModel = require('../models/PhoneModel');
const PhoneColor = require('../models/PhoneColor');
const Shop = require('../models/Shop');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Banner = require('../models/Banner');
const cloudinary = require('../utils/cloudinary');
const upload = require('../middleware/upload');

// Import District and Town models
const District = require('../models/District');
const Town = require('../models/Town');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    console.log('Fetching admin dashboard statistics...');
    
    // Use Promise.all to run queries in parallel
    const [totalUsers, totalPosts, activePosts, resolvedPosts, bannedUsers, pendingShops, recentPosts, recentUsers] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ status: 'active' }),
      Post.countDocuments({ status: 'resolved' }),
      User.countDocuments({ isBanned: true }),
      Shop.countDocuments({ isApproved: false }),
      Post.find().populate('author', 'username').sort({ createdAt: -1 }).limit(5),
      User.find().sort({ createdAt: -1 }).limit(5)
    ]);
    
    // Ensure we always return numeric values, even if the counts are undefined
    const stats = {
      totalUsers: totalUsers || 0,
      totalPosts: totalPosts || 0,
      activePosts: activePosts || 0,
      resolvedPosts: resolvedPosts || 0,
      bannedUsers: bannedUsers || 0,
      pendingShops: pendingShops || 0,
      recentPosts,
      recentUsers
    };
    
    console.log('Admin dashboard statistics:', stats);
    
    // Send the response with explicit values
    res.json(stats);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch dashboard data',
      // Return zeros in case of error to prevent UI issues
      totalUsers: 0,
      totalPosts: 0,
      activePosts: 0,
      resolvedPosts: 0,
      bannedUsers: 0,
      pendingShops: 0,
      recentPosts: [],
      recentUsers: []
    });
  }
});

// Get all shops with pagination and filters
router.get('/shops', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      isApproved,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { shopName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by approval status
    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const shops = await Shop.find(query)
      .populate('user', 'username email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Shop.countDocuments(query);

    res.json({
      shops,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Shops fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch shops' });
  }
});

// Get single shop
router.get('/shops/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('user', 'username email phoneNumber createdAt lastLogin');
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.json({ shop });
  } catch (error) {
    console.error('Shop fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch shop' });
  }
});

// Approve shop
router.patch('/shops/:id/approve', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    if (shop.isApproved) {
      return res.status(400).json({ message: 'Shop is already approved' });
    }

    // Update shop approval status
    shop.isApproved = true;
    shop.approvedAt = new Date();
    shop.approvedBy = req.user._id;
    await shop.save();

    res.json({
      message: 'Shop approved successfully',
      shop
    });
  } catch (error) {
    console.error('Shop approval error:', error);
    res.status(500).json({ message: 'Failed to approve shop' });
  }
});

// Reject shop
router.delete('/shops/:id/reject', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    // Get user ID before deleting shop
    const userId = shop.user;

    // Delete shop
    await Shop.findByIdAndDelete(req.params.id);

    // Update user role back to regular user
    await User.findByIdAndUpdate(userId, { role: 'user' });

    res.json({
      message: 'Shop registration rejected successfully'
    });
  } catch (error) {
    console.error('Shop rejection error:', error);
    res.status(500).json({ message: 'Failed to reject shop' });
  }
});

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isBanned,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (role) {
      query.role = role;
    }
    if (isBanned !== undefined) {
      query.isBanned = isBanned === 'true';
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's posts
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      posts
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Ban/Unban user
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent banning admins
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban admin users' });
    }

    // Toggle the ban status
    const isBanned = !user.isBanned;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isBanned },
      { new: true }
    ).select('-password');

    res.json({
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('User ban error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Change user role
router.patch('/users/:id/role', [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { role } = req.body;
    const { id } = req.params;

    // Prevent changing own role
    if (id === req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot change your own role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('User role update error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (id === req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's posts
    await Post.deleteMany({ author: id });
    
    // Delete user
    await User.findByIdAndDelete(id);

    res.json({ message: 'User and associated posts deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get all posts with admin filters
router.get('/posts', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      author,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (status) {
      query.status = status;
    }
    if (author) {
      query.author = author;
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(query)
      .populate('author', 'username email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json(posts);
  } catch (error) {
    console.error('Admin posts fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Admin can update any post
router.put('/posts/:id', [
  body('title')
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('status')
    .optional()
    .isIn(['active', 'resolved', 'deleted'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'username');

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Admin post update error:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// Admin can delete any post
router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Admin post deletion error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// Bulk operations
router.post('/bulk-action', [
  body('action')
    .isIn(['ban', 'unban', 'delete', 'resolve', 'delete-posts'])
    .withMessage('Invalid action'),
  body('userIds')
    .optional()
    .isArray()
    .withMessage('userIds must be an array'),
  body('postIds')
    .optional()
    .isArray()
    .withMessage('postIds must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { action, userIds, postIds } = req.body;

    switch (action) {
      case 'ban':
        await User.updateMany(
          { _id: { $in: userIds }, role: { $ne: 'admin' } },
          { isBanned: true }
        );
        break;
      case 'unban':
        await User.updateMany(
          { _id: { $in: userIds } },
          { isBanned: false }
        );
        break;
      case 'delete':
        await Post.deleteMany({ author: { $in: userIds } });
        await User.deleteMany({ _id: { $in: userIds }, role: { $ne: 'admin' } });
        break;
      case 'resolve':
        await Post.updateMany(
          { _id: { $in: postIds } },
          { status: 'resolved' }
        );
        break;
      case 'delete-posts':
        await Post.deleteMany({ _id: { $in: postIds } });
        break;
    }

    res.json({ message: 'Bulk action completed successfully' });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ message: 'Failed to perform bulk action' });
  }
});

// PHONE BRANDS MANAGEMENT
// Get all brands
router.get('/phone-brands', async (req, res) => {
  try {
    const brands = await PhoneBrand.find().sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    console.error('Brands fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
});

// Create new brand
router.post('/phone-brands', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand name must be between 1 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, logo } = req.body;
    
    // Check if brand already exists
    const existingBrand = await PhoneBrand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand already exists' });
    }
    
    const brand = new PhoneBrand({ name, logo });
    await brand.save();
    
    res.status(201).json({
      message: 'Brand created successfully',
      brand
    });
  } catch (error) {
    console.error('Brand creation error:', error);
    res.status(500).json({ message: 'Failed to create brand' });
  }
});

// Update brand
router.put('/phone-brands/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand name must be between 1 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, logo } = req.body;
    
    // Check if name is changed and already exists
    if (name) {
      const existingBrand = await PhoneBrand.findOne({ 
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      
      if (existingBrand) {
        return res.status(400).json({ message: 'Brand name already exists' });
      }
    }
    
    const brand = await PhoneBrand.findByIdAndUpdate(
      req.params.id,
      { $set: { name, logo } },
      { new: true, runValidators: true }
    );
    
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    res.json({
      message: 'Brand updated successfully',
      brand
    });
  } catch (error) {
    console.error('Brand update error:', error);
    res.status(500).json({ message: 'Failed to update brand' });
  }
});

// Delete brand
router.delete('/phone-brands/:id', async (req, res) => {
  try {
    const brand = await PhoneBrand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    // Check if brand has models
    const modelCount = await PhoneModel.countDocuments({ brand: req.params.id });
    if (modelCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete brand with associated models. Delete models first.' 
      });
    }
    
    await PhoneBrand.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Brand deletion error:', error);
    res.status(500).json({ message: 'Failed to delete brand' });
  }
});

// PHONE MODELS MANAGEMENT
// Get all models or models by brand
router.get('/phone-models', async (req, res) => {
  try {
    const { brandId } = req.query;
    
    const query = {};
    if (brandId) {
      query.brand = brandId;
    }
    
    const models = await PhoneModel.find(query)
      .populate('brand', 'name')
      .sort({ name: 1 });
      
    res.json(models);
  } catch (error) {
    console.error('Models fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch models' });
  }
});

// Create new model
router.post('/phone-models', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model name must be between 1 and 100 characters'),
  body('brandId')
    .isMongoId()
    .withMessage('Valid brand ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, image, brandId } = req.body;
    
    // Verify brand exists
    const brand = await PhoneBrand.findById(brandId);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    // Check if model already exists for this brand
    const existingModel = await PhoneModel.findOne({ 
      brand: brandId,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingModel) {
      return res.status(400).json({ message: 'Model already exists for this brand' });
    }
    
    const model = new PhoneModel({
      name,
      brand: brandId,
      image
    });
    
    await model.save();
    
    const populatedModel = await PhoneModel.findById(model._id).populate('brand', 'name');
    
    res.status(201).json({
      message: 'Phone model created successfully',
      model: populatedModel
    });
  } catch (error) {
    console.error('Model creation error:', error);
    res.status(500).json({ message: 'Failed to create phone model' });
  }
});

// Update model
router.put('/phone-models/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model name must be between 1 and 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, image, brandId } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (image) updateData.image = image;
    if (brandId) {
      // Verify brand exists
      const brand = await PhoneBrand.findById(brandId);
      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }
      updateData.brand = brandId;
    }
    
    // Check if name is changed and already exists
    if (name && brandId) {
      const existingModel = await PhoneModel.findOne({ 
        _id: { $ne: req.params.id },
        brand: brandId,
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      
      if (existingModel) {
        return res.status(400).json({ message: 'Model name already exists for this brand' });
      }
    }
    
    const model = await PhoneModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('brand', 'name');
    
    if (!model) {
      return res.status(404).json({ message: 'Phone model not found' });
    }
    
    res.json({
      message: 'Phone model updated successfully',
      model
    });
  } catch (error) {
    console.error('Model update error:', error);
    res.status(500).json({ message: 'Failed to update phone model' });
  }
});

// Delete model
router.delete('/phone-models/:id', async (req, res) => {
  try {
    const model = await PhoneModel.findById(req.params.id);
    if (!model) {
      return res.status(404).json({ message: 'Phone model not found' });
    }
    
    // Check if model has colors
    const colorCount = await PhoneColor.countDocuments({ phoneModel: req.params.id });
    if (colorCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete model with associated colors. Delete colors first.' 
      });
    }
    
    await PhoneModel.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Phone model deleted successfully' });
  } catch (error) {
    console.error('Model deletion error:', error);
    res.status(500).json({ message: 'Failed to delete phone model' });
  }
});

// PHONE COLORS MANAGEMENT
// Get all colors or colors by model
router.get('/phone-colors', async (req, res) => {
  try {
    const { modelId } = req.query;
    
    const query = {};
    if (modelId) {
      query.phoneModel = modelId;
    }
    
    const colors = await PhoneColor.find(query)
      .populate({
        path: 'phoneModel',
        select: 'name',
        populate: {
          path: 'brand',
          select: 'name'
        }
      })
      .sort({ name: 1 });
      
    res.json(colors);
  } catch (error) {
    console.error('Colors fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch colors' });
  }
});

// Create new color
router.post('/phone-colors', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Color name must be between 1 and 30 characters'),
  body('modelId')
    .isMongoId()
    .withMessage('Valid model ID is required'),
  body('hexCode')
    .optional({ nullable: true, checkFalsy: true })
    .isHexColor()
    .withMessage('Must be a valid hex color code')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, hexCode, modelId } = req.body;
    
    // Verify model exists
    const model = await PhoneModel.findById(modelId);
    if (!model) {
      return res.status(404).json({ message: 'Phone model not found' });
    }
    
    // Check if color already exists for this model
    const existingColor = await PhoneColor.findOne({ 
      phoneModel: modelId,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    
    if (existingColor) {
      return res.status(400).json({ message: 'Color already exists for this model' });
    }
    
    // Create color object with only required fields
    const colorData = {
      name,
      phoneModel: modelId
    };
    
    // Only add hexCode if provided
    if (hexCode) {
      colorData.hexCode = hexCode;
    }
    
    const color = new PhoneColor(colorData);
    await color.save();
    
    const populatedColor = await PhoneColor.findById(color._id).populate({
      path: 'phoneModel',
      select: 'name',
      populate: {
        path: 'brand',
        select: 'name'
      }
    });
    
    res.status(201).json({
      message: 'Color created successfully',
      color: populatedColor
    });
  } catch (error) {
    console.error('Color creation error:', error);
    res.status(500).json({ message: 'Failed to create color' });
  }
});

// Update color
router.put('/phone-colors/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Color name must be between 1 and 30 characters'),
  body('hexCode')
    .optional({ nullable: true, checkFalsy: true })
    .isHexColor()
    .withMessage('Must be a valid hex color code')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Update validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, hexCode, modelId } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (hexCode || hexCode === '') {
      // If hexCode is empty string, set to null to remove it
      updateData.hexCode = hexCode || null;
    }
    
    if (modelId) {
      // Verify model exists
      const model = await PhoneModel.findById(modelId);
      if (!model) {
        return res.status(404).json({ message: 'Phone model not found' });
      }
      updateData.phoneModel = modelId;
    }
    
    // Check if name is changed and already exists for this model
    if (name && modelId) {
      const existingColor = await PhoneColor.findOne({ 
        _id: { $ne: req.params.id },
        phoneModel: modelId,
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      
      if (existingColor) {
        return res.status(400).json({ message: 'Color name already exists for this model' });
      }
    }
    
    const color = await PhoneColor.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate({
      path: 'phoneModel',
      select: 'name',
      populate: {
        path: 'brand',
        select: 'name'
      }
    });
    
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    
    res.json({
      message: 'Color updated successfully',
      color
    });
  } catch (error) {
    console.error('Color update error:', error);
    res.status(500).json({ message: 'Failed to update color' });
  }
});

// Delete color
router.delete('/phone-colors/:id', async (req, res) => {
  try {
    const color = await PhoneColor.findById(req.params.id);
    if (!color) {
      return res.status(404).json({ message: 'Color not found' });
    }
    
    await PhoneColor.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Color deleted successfully' });
  } catch (error) {
    console.error('Color deletion error:', error);
    res.status(500).json({ message: 'Failed to delete color' });
  }
});

// Banner Management Routes
// Get all banners
router.get('/banners', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
});

// Get a single banner
router.get('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({ message: 'Failed to fetch banner' });
  }
});

// Create a new banner
router.post('/banners', async (req, res) => {
  try {
    const banner = new Banner({
      title: req.body.title,
      subtitle: req.body.subtitle,
      imageUrl: req.body.imageUrl,
      buttonText: req.body.buttonText || 'Learn More',
      buttonLink: req.body.buttonLink || '/',
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
      order: req.body.order || 0
    });
    
    await banner.save();
    res.status(201).json({ message: 'Banner created successfully', banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ message: 'Failed to create banner' });
  }
});

// Update a banner
router.put('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    // Update fields
    if (req.body.title) banner.title = req.body.title;
    if (req.body.subtitle) banner.subtitle = req.body.subtitle;
    if (req.body.imageUrl) banner.imageUrl = req.body.imageUrl;
    if (req.body.buttonText) banner.buttonText = req.body.buttonText;
    if (req.body.buttonLink) banner.buttonLink = req.body.buttonLink;
    if (req.body.order !== undefined) banner.order = req.body.order;
    if (req.body.isActive !== undefined) {
      banner.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }
    
    await banner.save();
    res.json({ message: 'Banner updated successfully', banner });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({ message: 'Failed to update banner' });
  }
});

// Delete a banner
router.delete('/banners/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    // Delete banner from database
    await Banner.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Failed to delete banner' });
  }
});

// District management routes
router.get('/districts', authenticateToken, async (req, res) => {
  try {
    const districts = await District.find().sort({ name: 1 });
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/districts', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'District name is required' });
    }
    
    const existingDistrict = await District.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingDistrict) {
      return res.status(400).json({ message: 'District already exists' });
    }
    
    const district = new District({ name });
    await district.save();
    
    res.status(201).json(district);
  } catch (error) {
    console.error('Error creating district:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/districts/:id', authenticateToken, async (req, res) => {
  try {
    const { name, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'District name is required' });
    }
    
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    
    // Check if name is being changed and if it already exists
    if (name !== district.name) {
      const existingDistrict = await District.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      
      if (existingDistrict) {
        return res.status(400).json({ message: 'District name already exists' });
      }
    }
    
    district.name = name;
    if (isActive !== undefined) district.isActive = isActive;
    
    await district.save();
    res.json(district);
  } catch (error) {
    console.error('Error updating district:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/districts/:id', authenticateToken, async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    
    // Check if district has towns
    const hasTowns = await Town.findOne({ district: req.params.id });
    if (hasTowns) {
      return res.status(400).json({ 
        message: 'Cannot delete district with associated towns. Remove towns first or deactivate the district instead.' 
      });
    }
    
    await district.deleteOne();
    res.json({ message: 'District deleted successfully' });
  } catch (error) {
    console.error('Error deleting district:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Town management routes
router.get('/towns', authenticateToken, async (req, res) => {
  try {
    const { districtId } = req.query;
    
    let query = {};
    if (districtId) {
      query.district = districtId;
    }
    
    const towns = await Town.find(query)
      .populate('district', 'name')
      .sort({ name: 1 });
      
    res.json(towns);
  } catch (error) {
    console.error('Error fetching towns:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/towns', authenticateToken, async (req, res) => {
  try {
    const { name, districtId } = req.body;
    
    if (!name || !districtId) {
      return res.status(400).json({ message: 'Town name and district are required' });
    }
    
    // Check if district exists
    const district = await District.findById(districtId);
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    
    // Check if town already exists in this district
    const existingTown = await Town.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      district: districtId
    });
    
    if (existingTown) {
      return res.status(400).json({ message: 'Town already exists in this district' });
    }
    
    const town = new Town({
      name,
      district: districtId
    });
    
    await town.save();
    
    const populatedTown = await Town.findById(town._id).populate('district', 'name');
    res.status(201).json(populatedTown);
  } catch (error) {
    console.error('Error creating town:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/towns/:id', authenticateToken, async (req, res) => {
  try {
    const { name, districtId, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Town name is required' });
    }
    
    const town = await Town.findById(req.params.id);
    if (!town) {
      return res.status(404).json({ message: 'Town not found' });
    }
    
    // If district is being changed, check if it exists
    if (districtId && districtId !== town.district.toString()) {
      const district = await District.findById(districtId);
      if (!district) {
        return res.status(404).json({ message: 'District not found' });
      }
      
      town.district = districtId;
    }
    
    // Check if name is being changed and if it already exists in the district
    if (name !== town.name || (districtId && districtId !== town.district.toString())) {
      const existingTown = await Town.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        district: districtId || town.district,
        _id: { $ne: req.params.id }
      });
      
      if (existingTown) {
        return res.status(400).json({ message: 'Town name already exists in this district' });
      }
    }
    
    town.name = name;
    if (isActive !== undefined) town.isActive = isActive;
    
    await town.save();
    
    const updatedTown = await Town.findById(town._id).populate('district', 'name');
    res.json(updatedTown);
  } catch (error) {
    console.error('Error updating town:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/towns/:id', authenticateToken, async (req, res) => {
  try {
    const town = await Town.findById(req.params.id);
    if (!town) {
      return res.status(404).json({ message: 'Town not found' });
    }
    
    await town.deleteOne();
    res.json({ message: 'Town deleted successfully' });
  } catch (error) {
    console.error('Error deleting town:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 