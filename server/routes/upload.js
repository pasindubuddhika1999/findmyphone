const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { authenticateToken } = require('../middleware/auth');

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

// Upload single image
router.post('/single', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'lost-phone-platform',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    res.json({
      message: 'Image uploaded successfully',
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Upload multiple images
router.post('/multiple', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const uploadPromises = req.files.map(async (file) => {
      // Convert buffer to base64
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'lost-phone-platform',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    res.json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

// Delete image from Cloudinary
router.delete('/:publicId', authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum 5 files allowed.' });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ message: error.message });
  }

  next(error);
});

module.exports = router; 