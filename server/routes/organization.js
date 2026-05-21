const express = require('express');
const Organization = require('../models/Organization');
const Subscription = require('../models/Subscription');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

const MANAGEMENT = ["super_admin", "owner", "admin", "branch_manager"];
const OWNER_UP = ["super_admin", "owner"];

// GET /api/organization
router.get('/', protect, async (req, res) => {
  try {
    // ✅ super_admin has no organization
    if (req.user.role === 'super_admin') {
      return res.json({
        success: true,
        organization: null,
        subscription: null
      });
    }

    const organization = await Organization.findById(req.user.organization)
      .populate('owner', 'name email');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const subscription = await Subscription.findOne({ 
      organization: organization._id 
    }).sort('-createdAt');

    res.json({
      success: true,
      organization,
      subscription
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch organization', 
      error: error.message 
    });
  }
});

// PUT /api/organization
router.put('/', protect, authorize(...OWNER_UP), async (req, res) => {
  try {
    const { name, logo, brandColor, contactInfo, settings } = req.body;

    const organization = await Organization.findById(req.user.organization);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (name) organization.name = name;
    if (logo) organization.logo = logo;
    if (brandColor) organization.brandColor = { ...organization.brandColor, ...brandColor };
    if (contactInfo) organization.contactInfo = { ...organization.contactInfo, ...contactInfo };
    if (settings) organization.settings = { ...organization.settings, ...settings };

    await organization.save();

    res.json({
      success: true,
      message: 'Organization updated successfully',
      organization
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update organization', 
      error: error.message 
    });
  }
});

// GET /api/organization/usage
router.get('/usage', protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const Branch = require('../models/Branch');
    const Table = require('../models/Table');
    const User = require('../models/User');
    const MenuItem = require('../models/MenuItem');
    const Order = require('../models/Order');

    const [
      branchCount,
      tableCount,
      staffCount,
      menuItemCount,
      orderCount
    ] = await Promise.all([
      Branch.countDocuments({ organization: req.user.organization }),
      Table.countDocuments({ organization: req.user.organization }),
      User.countDocuments({ organization: req.user.organization, role: { $ne: 'owner' } }),
      MenuItem.countDocuments({ organization: req.user.organization }),
      Order.countDocuments({ 
        organization: req.user.organization,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    ]);

    const organization = await Organization.findById(req.user.organization);

    res.json({
      success: true,
      usage: {
        branches: branchCount,
        tables: tableCount,
        staff: staffCount,
        menuItems: menuItemCount,
        ordersToday: orderCount
      },
      limits: organization.limits,
      warnings: {
        branchesNearLimit: branchCount >= organization.limits.branches * 0.8,
        tablesNearLimit: tableCount >= organization.limits.tables * 0.8,
        staffNearLimit: staffCount >= organization.limits.staff * 0.8,
        menuItemsNearLimit: menuItemCount >= organization.limits.menuItems * 0.8
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch usage statistics', 
      error: error.message 
    });
  }
});

module.exports = router;