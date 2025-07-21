const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Post = require('../models/Post');
const PhoneBrand = require('../models/PhoneBrand');
const PhoneModel = require('../models/PhoneModel');
const PhoneColor = require('../models/PhoneColor');
const { authenticateToken, requireOwnership, optionalAuth } = require('../middleware/auth');
const Shop = require('../models/Shop');
const Banner = require('../models/Banner');
const District = require('../models/District');
const Town = require('../models/Town');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Get all posts (public - no auth required)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      imei,
      brand,
      model,
      location,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isPublic: true };

    // Filter by status
    if (status !== 'all') {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Specific filters
    if (imei) {
      query.imei = { $regex: imei, $options: 'i' };
    }
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }
    if (model) {
      query.phoneModel = { $regex: model, $options: 'i' };
    }
    if (location) {
      query.lostLocation = { $regex: location, $options: 'i' };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(query)
      .populate('author', 'username')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Posts fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Public routes for phone metadata (no auth required)

// Get all phone brands
router.get('/phone-brands', async (req, res) => {
  try {
    console.log('Fetching all brands...');
    const brands = await PhoneBrand.find().sort({ name: 1 });
    console.log('Found brands:', brands.length);
    res.json(brands);
  } catch (error) {
    console.error('Brands fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
});

// Seed phone brands (development only)
router.get('/seed-phone-brands', async (req, res) => {
  try {
    // Check if we already have brands
    const existingBrands = await PhoneBrand.countDocuments();
    
    if (existingBrands > 0) {
      return res.json({ 
        message: 'Brands already exist', 
        count: existingBrands 
      });
    }
    
    // Sample brands to seed
    const brandsToSeed = [
      { name: 'Samsung', logo: 'https://example.com/samsung.png' },
      { name: 'Apple', logo: 'https://example.com/apple.png' },
      { name: 'Google', logo: 'https://example.com/google.png' },
      { name: 'Xiaomi', logo: 'https://example.com/xiaomi.png' },
      { name: 'OnePlus', logo: 'https://example.com/oneplus.png' },
      { name: 'Huawei', logo: 'https://example.com/huawei.png' },
      { name: 'Oppo', logo: 'https://example.com/oppo.png' },
      { name: 'Vivo', logo: 'https://example.com/vivo.png' },
      { name: 'Motorola', logo: 'https://example.com/motorola.png' },
      { name: 'Nokia', logo: 'https://example.com/nokia.png' },
    ];
    
    // Insert brands
    await PhoneBrand.insertMany(brandsToSeed);
    
    res.json({ 
      message: 'Phone brands seeded successfully', 
      count: brandsToSeed.length 
    });
  } catch (error) {
    console.error('Seed brands error:', error);
    res.status(500).json({ message: 'Failed to seed brands' });
  }
});

// Get phone models by brand
router.get('/phone-models', async (req, res) => {
  try {
    const { brandId, search } = req.query;
    
    if (!brandId && !search) {
      return res.status(400).json({ message: 'brandId or search parameter is required' });
    }
    
    const query = {};
    
    if (brandId) {
      query.brand = brandId; // This maps to the PhoneModel schema's 'brand' field
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    console.log('Fetching models with query:', query);
    
    const models = await PhoneModel.find(query)
      .populate('brand', 'name')
      .sort({ name: 1 })
      .limit(50); // Limit results for type-ahead
    
    console.log('Found models:', models.length);
    
    res.json(models);
  } catch (error) {
    console.error('Models fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch models' });
  }
});

// Get phone colors by model
router.get('/phone-colors', async (req, res) => {
  try {
    const { modelId, search } = req.query;
    
    if (!modelId && !search) {
      return res.status(400).json({ message: 'modelId or search parameter is required' });
    }
    
    const query = {};
    
    if (modelId) {
      query.phoneModel = modelId; // This maps to the PhoneColor schema's 'phoneModel' field
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    console.log('Fetching colors with query:', query);
    
    const colors = await PhoneColor.find(query)
      .sort({ name: 1 })
      .limit(50); // Limit results for type-ahead
    
    console.log('Found colors:', colors.length);
    
    res.json(colors);
  } catch (error) {
    console.error('Colors fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch colors' });
  }
});

// Get post statistics - consolidated endpoint
router.get('/statistics', async (req, res) => {
  try {
    console.log('Fetching consolidated statistics...');
    
    // Use Promise.all to run queries in parallel
    const [totalPosts, activePosts, resolvedPosts] = await Promise.all([
      Post.countDocuments({ isPublic: true }),
      Post.countDocuments({ isPublic: true, status: 'active' }),
      Post.countDocuments({ isPublic: true, status: 'resolved' })
    ]);
    
    // Ensure we always return numeric values, even if the counts are undefined
    const stats = {
      totalPosts: totalPosts || 0,
      activePosts: activePosts || 0,
      resolvedPosts: resolvedPosts || 0
    };
    
    console.log('Statistics:', stats);
    
    // Send the response with explicit values
    res.json(stats);
  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch statistics',
      // Return zeros in case of error to prevent UI issues
      totalPosts: 0,
      activePosts: 0,
      resolvedPosts: 0
    });
  }
});

// Get user's posts
router.get('/user/my-posts', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { author: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('User posts fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch user posts' });
  }
});

// Search posts by IMEI
router.get('/search/imei/:imei', optionalAuth, async (req, res) => {
  try {
    const { imei } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      imei: { $regex: imei, $options: 'i' },
      isPublic: true,
      status: 'active'
    })
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Post.countDocuments({
      imei: { $regex: imei, $options: 'i' },
      isPublic: true,
      status: 'active'
    });

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('IMEI search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Get all districts (public endpoint)
router.get('/districts', async (req, res) => {
  try {
    console.log('Fetching all districts...');
    const districts = await District.find({ isActive: true }).sort({ name: 1 });
    console.log('Found districts:', districts.length);
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ message: 'Failed to fetch districts' });
  }
});

// Get towns by district (public endpoint)
router.get('/towns', async (req, res) => {
  try {
    const { districtId } = req.query;
    
    if (!districtId) {
      return res.status(400).json({ message: 'District ID is required' });
    }
    
    console.log('Fetching towns for district:', districtId);
    const towns = await Town.find({ 
      district: districtId,
      isActive: true 
    }).sort({ name: 1 });
    
    console.log('Found towns:', towns.length);
    res.json(towns);
  } catch (error) {
    console.error('Error fetching towns:', error);
    res.status(500).json({ message: 'Failed to fetch towns' });
  }
});

// Get single post - MUST BE AFTER ALL OTHER GET ROUTES WITH SPECIFIC PATHS
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({ post });
  } catch (error) {
    console.error('Post fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

// Create new post (requires auth)
router.post('/', authenticateToken, upload.array('images', 5), [
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('imei')
    .isLength({ min: 15, max: 15 })
    .withMessage('IMEI must be exactly 15 characters')
    .matches(/^[0-9]+$/)
    .withMessage('IMEI must contain only numbers'),
  body('phoneModel')
    .notEmpty()
    .withMessage('Phone model is required'),
  body('brand')
    .notEmpty()
    .withMessage('Brand is required'),
  body('color')
    .notEmpty()
    .withMessage('Color is required'),
  body('lostLocation')
    .notEmpty()
    .withMessage('Lost location is required'),
  body('lostDate')
    .isISO8601()
    .withMessage('Valid lost date is required'),
  body('contactInfo.name')
    .notEmpty()
    .withMessage('Contact name is required'),
  body('contactInfo.phone')
    .notEmpty()
    .withMessage('Contact phone is required'),
  body('contactInfo.email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Valid contact email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    // Upload images to Cloudinary if any
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} files for upload`);
      
      const uploadPromises = req.files.map(async (file, index) => {
        try {
          console.log(`Processing file ${index + 1}/${req.files.length}: ${file.originalname} (${file.size} bytes)`);
          
          // Convert buffer to base64
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = `data:${file.mimetype};base64,${b64}`;

          // Upload to Cloudinary
          console.log(`Uploading file ${index + 1} to Cloudinary...`);
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'lost-phone-platform',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' }
            ]
          });
          console.log(`File ${index + 1} uploaded successfully, URL: ${result.secure_url}`);

          return {
            url: result.secure_url,
            publicId: result.public_id
          };
        } catch (uploadError) {
          console.error(`Error uploading file ${index + 1}:`, uploadError);
          throw uploadError;
        }
      });

      try {
        uploadedImages = await Promise.all(uploadPromises);
        console.log(`All ${uploadedImages.length} images uploaded successfully`);
      } catch (uploadError) {
        console.error('Failed to upload one or more images:', uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }
    }

    const postData = {
      ...req.body,
      author: req.user._id,
      lostDate: new Date(req.body.lostDate),
      images: uploadedImages
    };

    // If the user is a shop, mark the post as created by a shop
    if (req.user.role === 'shop') {
      // Get the shop details
      const shop = await Shop.findOne({ user: req.user._id });
      if (!shop) {
        return res.status(400).json({ message: 'Shop profile not found' });
      }
      
      // Only approved shops can create posts
      if (!shop.isApproved) {
        return res.status(403).json({ message: 'Your shop must be approved before creating posts' });
      }
      
      postData.createdByShop = shop._id;
      postData.isShopCreated = true;
    }

    const post = new Post(postData);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username')
      .populate('createdByShop', 'shopName');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Post creation error:', error);
    // Send more detailed error for debugging
    res.status(500).json({ 
      message: 'Failed to create post', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Update post (owner or admin only)
router.put('/:id', authenticateToken, requireOwnership(Post), [
  body('title')
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('imei')
    .optional()
    .isLength({ min: 15, max: 15 })
    .withMessage('IMEI must be exactly 15 characters')
    .matches(/^[0-9]+$/)
    .withMessage('IMEI must contain only numbers'),
  body('lostDate')
    .optional()
    .isISO8601()
    .withMessage('Valid lost date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const updates = { ...req.body };
    
    if (updates.lostDate) {
      updates.lostDate = new Date(updates.lostDate);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'username');

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Post update error:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// Mark post as resolved (owner or admin only)
router.patch('/:id/resolve', authenticateToken, requireOwnership(Post), async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    ).populate('author', 'username');

    res.json({
      message: 'Post marked as resolved',
      post
    });
  } catch (error) {
    console.error('Post resolve error:', error);
    res.status(500).json({ message: 'Failed to resolve post' });
  }
});

// Delete post (owner or admin only)
router.delete('/:id', authenticateToken, requireOwnership(Post), async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Post deletion error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// Seed phone models (development only)
router.get('/seed-phone-models', async (req, res) => {
  try {
    // Check if we already have models
    const existingModels = await PhoneModel.countDocuments();
    
    if (existingModels > 0) {
      return res.json({ 
        message: 'Phone models already exist', 
        count: existingModels 
      });
    }
    
    // Get brands to associate models with
    const brands = await PhoneBrand.find();
    
    if (brands.length === 0) {
      return res.status(400).json({ 
        message: 'No brands found. Please seed brands first.' 
      });
    }
    
    // Find brand IDs by name
    const getBrandIdByName = (name) => {
      const brand = brands.find(b => b.name.toLowerCase() === name.toLowerCase());
      return brand ? brand._id : null;
    };
    
    // Sample models to seed
    const modelsToSeed = [
      // Samsung models
      { name: 'Galaxy S21', brand: getBrandIdByName('Samsung') },
      { name: 'Galaxy S22', brand: getBrandIdByName('Samsung') },
      { name: 'Galaxy S23', brand: getBrandIdByName('Samsung') },
      { name: 'Galaxy Note 20', brand: getBrandIdByName('Samsung') },
      { name: 'Galaxy A53', brand: getBrandIdByName('Samsung') },
      
      // Apple models
      { name: 'iPhone 13', brand: getBrandIdByName('Apple') },
      { name: 'iPhone 14', brand: getBrandIdByName('Apple') },
      { name: 'iPhone 15', brand: getBrandIdByName('Apple') },
      { name: 'iPhone SE', brand: getBrandIdByName('Apple') },
      { name: 'iPhone 12', brand: getBrandIdByName('Apple') },
      
      // Google models
      { name: 'Pixel 6', brand: getBrandIdByName('Google') },
      { name: 'Pixel 7', brand: getBrandIdByName('Google') },
      { name: 'Pixel 8', brand: getBrandIdByName('Google') },
      
      // Xiaomi models
      { name: 'Redmi Note 12', brand: getBrandIdByName('Xiaomi') },
      { name: 'Mi 13', brand: getBrandIdByName('Xiaomi') },
      { name: 'Poco F5', brand: getBrandIdByName('Xiaomi') },
    ];
    
    // Filter out models with null brand IDs
    const validModels = modelsToSeed.filter(model => model.brand !== null);
    
    if (validModels.length === 0) {
      return res.status(400).json({ 
        message: 'No valid models to seed. Check brand names.' 
      });
    }
    
    // Insert models
    await PhoneModel.insertMany(validModels);

    res.json({
      message: 'Phone models seeded successfully', 
      count: validModels.length 
    });
  } catch (error) {
    console.error('Seed models error:', error);
    res.status(500).json({ message: 'Failed to seed models' });
  }
});

// Seed phone colors (development only)
router.get('/seed-phone-colors', async (req, res) => {
  try {
    // Check if we already have colors
    const existingColors = await PhoneColor.countDocuments();
    
    if (existingColors > 0) {
      return res.json({ 
        message: 'Phone colors already exist', 
        count: existingColors 
      });
    }
    
    // Get models to associate colors with
    const models = await PhoneModel.find();
    
    if (models.length === 0) {
      return res.status(400).json({ 
        message: 'No phone models found. Please seed models first.' 
      });
    }
    
    // Common colors for all phone models
    const commonColors = ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Red', 'Green'];
    
    // Create color entries for each model
    const colorsToSeed = [];
    
    models.forEach(model => {
      // For each model, add 3-5 random colors
      const numColors = Math.floor(Math.random() * 3) + 3; // 3 to 5 colors
      const modelColors = [...commonColors].sort(() => 0.5 - Math.random()).slice(0, numColors);
      
      modelColors.forEach(colorName => {
        colorsToSeed.push({
          name: colorName,
          phoneModel: model._id,
          hexCode: getRandomHexColor()
        });
      });
    });
    
    // Insert colors
    await PhoneColor.insertMany(colorsToSeed);

    res.json({
      message: 'Phone colors seeded successfully', 
      count: colorsToSeed.length 
    });
  } catch (error) {
    console.error('Seed colors error:', error);
    res.status(500).json({ message: 'Failed to seed colors' });
  }
});

// Helper function to generate random hex color codes
function getRandomHexColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Get active banners for homepage
router.get('/banners', async (req, res) => {
  try {
    console.log('Fetching active banners...');
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    console.log(`Found ${banners.length} active banners`);
    res.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
});

module.exports = router; 