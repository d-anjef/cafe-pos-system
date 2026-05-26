const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Branch = require("../models/Branch");
const Organization = require("../models/Organization");

const MANAGEMENT = ["super_admin", "owner", "admin"];

// ============================================================
// GET /api/staff
// List all staff in current organization
// ============================================================
router.get("/", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;

    const staff = await User.find({
      organization: orgId,
      role: { $ne: "owner" }   // exclude owner from staff list
    })
      .populate("branches", "name code")
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// POST /api/staff
// Create new staff member
// ============================================================
router.post("/", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const { name, email, password, role, branches, phone, salary } = req.body;
    const orgId = req.user.organization?._id || req.user.organization;

    // Validate
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // Check role is allowed
    const allowedRoles = ["admin", "branch_manager", "waiter", "kitchen"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    // Email exists?
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already in use"
      });
    }

    // Check org staff limit
    const organization = await Organization.findById(orgId);
    const currentStaffCount = await User.countDocuments({
      organization: orgId,
      role: { $ne: "owner" }
    });

    if (currentStaffCount >= organization.limits.staff) {
      return res.status(403).json({
        success: false,
        message: `Staff limit reached (${organization.limits.staff}). Upgrade your plan to add more staff.`
      });
    }

    // Validate branches belong to org
    let branchIds = [];
    if (branches && branches.length > 0) {
      const validBranches = await Branch.find({
        _id: { $in: branches },
        organization: orgId
      });
      branchIds = validBranches.map(b => b._id);
    }

    // Create staff
    const newStaff = await User.create({
      organization: orgId,
      branches: branchIds,
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      salary,
      isActive: true
    });

    const populated = await User.findById(newStaff._id)
      .populate("branches", "name code")
      .select("-password");

    res.status(201).json({
      success: true,
      message: "Staff added successfully",
      staff: populated
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// PUT /api/staff/:id
// Update staff (name, role, branches, etc)
// ============================================================
router.put("/:id", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const { name, role, branches, phone, salary, isActive } = req.body;

    const staff = await User.findOne({
      _id: req.params.id,
      organization: orgId,
      role: { $ne: "owner" }
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    if (name) staff.name = name;
    if (role && ["admin", "branch_manager", "waiter", "kitchen"].includes(role)) {
      staff.role = role;
    }
    if (branches !== undefined) {
      const validBranches = await Branch.find({
        _id: { $in: branches },
        organization: orgId
      });
      staff.branches = validBranches.map(b => b._id);
    }
    if (phone !== undefined) staff.phone = phone;
    if (salary !== undefined) staff.salary = salary;
    if (isActive !== undefined) staff.isActive = isActive;

    await staff.save();

    const populated = await User.findById(staff._id)
      .populate("branches", "name code")
      .select("-password");

    res.json({ success: true, staff: populated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// PUT /api/staff/:id/reset-password
// Reset staff password
// ============================================================
router.put("/:id/reset-password", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    const staff = await User.findOne({
      _id: req.params.id,
      organization: orgId,
      role: { $ne: "owner" }
    }).select("+password");

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    staff.password = newPassword;
    await staff.save();

    res.json({ success: true, message: "Password reset successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// DELETE /api/staff/:id
// Delete staff member
// ============================================================
router.delete("/:id", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;

    const staff = await User.findOneAndDelete({
      _id: req.params.id,
      organization: orgId,
      role: { $ne: "owner" }
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, message: "Staff deleted successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;