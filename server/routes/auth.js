const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register user
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, email, password, phoneNumber } = req.body;

    // Check if user already exists
    let query = { username };
    if (email) {
      query = { $or: [{ email }, { username }] };
    }
    
    const existingUser = await User.findOne(query);

    if (existingUser) {
      return res.status(400).json({
        message: email && existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create new user
    const userData = {
      username,
      password,
      phoneNumber
    };
    
    // Add email only if provided
    if (email) {
      userData.email = email;
    }
    
    const user = new User(userData);

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        ...(user.email && { email: user.email }),
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Register shop
router.post('/register-shop', [
  // User validation
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  // Shop validation
  body('shopName')
    .isLength({ min: 3, max: 100 })
    .withMessage('Shop name must be between 3 and 100 characters'),
  body('ownerName')
    .isLength({ min: 3, max: 100 })
    .withMessage('Owner name must be between 3 and 100 characters'),
  body('contactNumber')
    .isMobilePhone()
    .withMessage('Please provide a valid contact number'),
  body('address')
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('location')
    .isLength({ min: 3, max: 100 })
    .withMessage('Location must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { 
      username, email, password, 
      shopName, ownerName, contactNumber, address, location, description 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Check if shop name already exists
    const existingShop = await Shop.findOne({ shopName });
    if (existingShop) {
      return res.status(400).json({
        message: 'Shop name already registered'
      });
    }

    // Create new user with shop role
    const user = new User({
      username,
      email,
      password,
      phoneNumber: contactNumber,
      role: 'shop'
    });

    await user.save();

    // Create shop profile
    const shop = new Shop({
      user: user._id,
      shopName,
      ownerName,
      contactNumber,
      address,
      location,
      description: description || '',
      isApproved: false
    });

    await shop.save();

    res.status(201).json({
      message: 'Shop registration submitted successfully. Please wait for admin approval before logging in.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      shop: {
        id: shop._id,
        shopName: shop.shopName,
        isApproved: shop.isApproved
      }
    });
  } catch (error) {
    console.error('Shop registration error:', error);
    res.status(500).json({ message: 'Shop registration failed' });
  }
});

// Login user
router.post('/login', [
  body('identifier')
    .notEmpty()
    .withMessage('Email or phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { identifier, password } = req.body;

    // Find user by email or phone number
    const query = { phoneNumber: identifier };
    
    // Only search by email if the identifier looks like an email
    if (identifier.includes('@')) {
      query.$or = [
        { email: identifier },
        { phoneNumber: identifier }
      ];
    }
    
    const user = await User.findOne(query);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ message: 'Account has been banned' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If user is a shop, check if approved
    if (user.role === 'shop') {
      const shop = await Shop.findOne({ user: user._id });
      
      if (!shop) {
        return res.status(404).json({ message: 'Shop profile not found' });
      }
      
      if (!shop.isApproved) {
        return res.status(403).json({ 
          message: 'Your shop account is pending approval. Please wait for admin approval before logging in.',
          isPendingApproval: true
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Include shop data if user is a shop
    let shopData = null;
    if (user.role === 'shop') {
      const shop = await Shop.findOne({ user: user._id });
      if (shop) {
        shopData = {
          id: shop._id,
          shopName: shop.shopName,
          ownerName: shop.ownerName,
          location: shop.location,
          isApproved: shop.isApproved
        };
      }
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      },
      shop: shopData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // If user is a shop, include shop data
    let shopData = null;
    if (req.user.role === 'shop') {
      const shop = await Shop.findOne({ user: req.user._id });
      if (shop) {
        shopData = {
          id: shop._id,
          shopName: shop.shopName,
          ownerName: shop.ownerName,
          contactNumber: shop.contactNumber,
          address: shop.address,
          location: shop.location,
          description: shop.description,
          isApproved: shop.isApproved,
          approvedAt: shop.approvedAt
        };
      }
    }

    res.json({
      user: req.user,
      shop: shopData
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, email, phoneNumber } = req.body;
    const updates = {};

    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      updates.username = username;
    }

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      updates.email = email;
    }

    if (phoneNumber) {
      updates.phoneNumber = phoneNumber;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const isCurrentPasswordValid = await req.user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Update shop profile
router.put('/shop-profile', authenticateToken, [
  body('shopName')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Shop name must be between 3 and 100 characters'),
  body('ownerName')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Owner name must be between 3 and 100 characters'),
  body('contactNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid contact number'),
  body('address')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('location')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Location must be between 3 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check if user is a shop
    if (req.user.role !== 'shop') {
      return res.status(403).json({ message: 'Only shop accounts can update shop profiles' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { shopName, ownerName, contactNumber, address, location, description } = req.body;
    
    // Find shop profile
    const shop = await Shop.findOne({ user: req.user._id });
    if (!shop) {
      return res.status(404).json({ message: 'Shop profile not found' });
    }

    // Check if shop name is already taken by another shop
    if (shopName && shopName !== shop.shopName) {
      const existingShop = await Shop.findOne({ shopName });
      if (existingShop && !existingShop._id.equals(shop._id)) {
        return res.status(400).json({ message: 'Shop name already taken' });
      }
    }

    // Update shop profile
    const updates = {};
    if (shopName) updates.shopName = shopName;
    if (ownerName) updates.ownerName = ownerName;
    if (contactNumber) updates.contactNumber = contactNumber;
    if (address) updates.address = address;
    if (location) updates.location = location;
    if (description !== undefined) updates.description = description;

    const updatedShop = await Shop.findByIdAndUpdate(
      shop._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Shop profile updated successfully',
      shop: updatedShop
    });
  } catch (error) {
    console.error('Shop profile update error:', error);
    res.status(500).json({ message: 'Failed to update shop profile' });
  }
});

module.exports = router; 