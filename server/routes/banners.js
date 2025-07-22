const express = require("express");
const Banner = require("../models/Banner");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Public route to get active banners for homepage
router.get("/", async (req, res) => {
  try {
    console.log("Fetching active banners...");
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    console.log(`Found ${banners.length} active banners`);
    res.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

// Admin routes for banner management
// Get all banners (including inactive)
router.get("/admin", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    console.error("Error fetching all banners:", error);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
});

// Get a single banner
router.get("/admin/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    res.json(banner);
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({ message: "Failed to fetch banner" });
  }
});

// Create a new banner
router.post("/admin", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const banner = new Banner({
      imageUrl: req.body.imageUrl,
      isActive: req.body.isActive === "true" || req.body.isActive === true,
      order: req.body.order || 0,
    });
    if (req.body.title) banner.title = req.body.title;
    if (req.body.subtitle) banner.subtitle = req.body.subtitle;
    if (req.body.buttonText) {
      banner.buttonText = req.body.buttonText;
      if (req.body.buttonLink) banner.buttonLink = req.body.buttonLink;
    }
    await banner.save();
    res.status(201).json({ message: "Banner created successfully", banner });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ message: "Failed to create banner" });
  }
});

// Update a banner
router.put("/admin/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }
    if (req.body.title !== undefined) banner.title = req.body.title;
    if (req.body.subtitle !== undefined) banner.subtitle = req.body.subtitle;
    if (req.body.imageUrl !== undefined) banner.imageUrl = req.body.imageUrl;
    if (req.body.buttonText) {
      banner.buttonText = req.body.buttonText;
      if (req.body.buttonLink) banner.buttonLink = req.body.buttonLink;
    } else {
      banner.buttonText = undefined;
      banner.buttonLink = undefined;
    }
    if (req.body.order !== undefined) banner.order = req.body.order;
    if (req.body.isActive !== undefined) {
      banner.isActive =
        req.body.isActive === "true" || req.body.isActive === true;
    }
    await banner.save();
    res.json({ message: "Banner updated successfully", banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ message: "Failed to update banner" });
  }
});

// Delete a banner
router.delete(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({ message: "Banner not found" });
      }

      // Delete banner from database
      await Banner.findByIdAndDelete(req.params.id);

      res.json({ message: "Banner deleted successfully" });
    } catch (error) {
      console.error("Error deleting banner:", error);
      res.status(500).json({ message: "Failed to delete banner" });
    }
  }
);

module.exports = router;
