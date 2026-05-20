const express = require('express');
const Branch = require('../models/Branch');
const Organization = require('../models/Organization');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/branches
// @desc    Get all branches for organization
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = { organization: req.user.organization };

    // If user is not owner/admin, filter by assigned branches
    if (!['owner', 'admin'].includes(req.user.role)) {
      query._id = { $in: req.user.branches };
    }

    const branches = await Branch.find(query).sort('name');

    res.json({
      success: true,
      count: branches.length,
      branches
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch branches', 
      error: error.message 
    });
  }
});

// @route   POST /api/branches
// @desc    Create new branch
// @access  Private (Owner/Admin)
router.post('/', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);

    // Check branch limit
    const currentBranchCount = await Branch.countDocuments({ 
      organization: req.user.organization 
    });

    if (currentBranchCount >= organization.limits.branches) {
      return res.status(403).json({
        success: false,
        message: `Branch limit reached. Upgrade your plan to add more branches. Current limit: ${organization.limits.branches}`
      });
    }

    const branch = await Branch.create({
      organization: req.user.organization,
      ...req.body
    });

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      branch
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to create branch', 
      error: error.message 
    });
  }
});

// @route   GET /api/branches/:id
// @desc    Get single branch
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const branch = await Branch.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Check access
    if (!['owner', 'admin'].includes(req.user.role) && 
        !req.user.branches.includes(branch._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this branch'
      });
    }

    res.json({
      success: true,
      branch
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch branch', 
      error: error.message 
    });
  }
});

// @route   PUT /api/branches/:id
// @desc    Update branch
// @access  Private (Owner/Admin/Branch Manager)
router.put('/:id', protect, authorize('owner', 'admin', 'branch_manager'), async (req, res) => {
  try {
    const branch = await Branch.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Update branch
    Object.assign(branch, req.body);
    await branch.save();

    res.json({
      success: true,
      message: 'Branch updated successfully',
      branch
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update branch', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/branches/:id
// @desc    Delete branch
// @access  Private (Owner only)
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const branch = await Branch.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Check if there are active orders
    const Order = require('../models/Order');
    const activeOrders = await Order.countDocuments({
      branch: branch._id,
      status: 'active'
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete branch with active orders'
      });
    }

    await branch.deleteOne();

    res.json({
      success: true,
      message: 'Branch deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete branch', 
      error: error.message 
    });
  }
});

module.exports = router;
