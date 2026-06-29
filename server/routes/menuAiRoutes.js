const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect, authorize } = require("../middleware/authMiddleware");
const { parseMenuImage } = require("../services/menuAiService");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");

const MANAGEMENT = ["super_admin", "owner", "admin", "branch_manager"];

// ============================================================
// MULTER CONFIG — Memory storage (we send to Gemini directly)
// ============================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024  // 10 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and WebP images are allowed"), false);
    }
  }
});

// ============================================================
// POST /api/menu-ai/parse
// Upload image → Gemini extracts menu → Return structured data
// ============================================================
router.post(
  "/parse",
  protect,
  authorize(...MANAGEMENT),
  upload.single("menuImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No image uploaded. Please select a menu image."
        });
      }

      console.log(
        `[MenuAI] User ${req.user.email} uploaded image (${(req.file.size / 1024).toFixed(1)} KB)`
      );

      // Send to Gemini
      const result = await parseMenuImage(req.file.buffer, req.file.mimetype);

      res.json({
        success: true,
        data: result
      });

    } catch (err) {
      console.error("[MenuAI] Parse error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to process image"
      });
    }
  }
);

// ============================================================
// POST /api/menu-ai/import
// Receive approved items → Bulk create in database
// ============================================================
router.post(
  "/import",
  protect,
  authorize(...MANAGEMENT),
  async (req, res) => {
    try {
      const { categories } = req.body;
      const orgId = req.user.organization?._id || req.user.organization;

      if (!categories || !Array.isArray(categories)) {
        return res.status(400).json({
          message: "Invalid data format"
        });
      }

      const stats = {
        categoriesCreated: 0,
        categoriesExisted: 0,
        itemsCreated: 0,
        itemsFailed: 0,
        errors: []
      };

      // Process each category
      for (const cat of categories) {
        try {
          // Check if category exists
          let category = await Category.findOne({
            organization: orgId,
            name: cat.name
          });

          // Create category if doesn't exist
          if (!category) {
            category = await Category.create({
              organization: orgId,
              name: cat.name,
              icon: cat.icon || "🍽️"
            });
            stats.categoriesCreated++;
            console.log(`[MenuAI Import] Created category: ${cat.name}`);
          } else {
            stats.categoriesExisted++;
          }

          // Create items in this category
          if (cat.items && Array.isArray(cat.items)) {
            for (const item of cat.items) {
              try {
                // Check if item already exists (avoid duplicates)
                const existing = await MenuItem.findOne({
                  organization: orgId,
                  name: item.name,
                  category: cat.name
                });

                if (existing) {
                  console.log(`[MenuAI Import] Skipped duplicate: ${item.name}`);
                  continue;
                }

                await MenuItem.create({
                  organization: orgId,
                  branches: req.user.branches?.map(b => b._id || b) || [],
                  name: item.name,
                  category: cat.name,
                  description: item.description || "",
                  price: Number(item.price) || 0,
                  isAvailable: true,
                  isTodaysSpecial: false,
                  hasVariants: false,
                  variantGroups: [],
                  tags: []
                });

                stats.itemsCreated++;

              } catch (itemErr) {
                stats.itemsFailed++;
                stats.errors.push(`${item.name}: ${itemErr.message}`);
                console.error(`[MenuAI Import] Failed item: ${item.name}`, itemErr.message);
              }
            }
          }

        } catch (catErr) {
          stats.errors.push(`Category ${cat.name}: ${catErr.message}`);
          console.error(`[MenuAI Import] Failed category: ${cat.name}`, catErr);
        }
      }

      console.log(`[MenuAI Import] Stats:`, stats);

      res.json({
        success: true,
        stats,
        message: `Imported ${stats.itemsCreated} items into ${stats.categoriesCreated + stats.categoriesExisted} categories`
      });

    } catch (err) {
      console.error("[MenuAI] Import error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Failed to import items"
      });
    }
  }
);

module.exports = router;