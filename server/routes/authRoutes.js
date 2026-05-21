const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// POST /api/auth/register
// Create new organization + owner account
// ============================================================
router.post('/register', async (req, res) => {
  try {
    const { organizationName, name, email, password } = req.body;

    if (!organizationName || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // Generate slug
    const baseSlug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await Organization.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Extract domain from owner email (e.g. "chiyaghar.com" from "test@chiyaghar.com")
    const emailDomain = email.split('@')[1];
    
    // Default staff password
    const staffPassword = `${slug.replace(/-/g, '')}123`;

    // 1. Create owner
    const owner = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'owner',
      isActive: true
    });

    // 2. Create organization
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const organization = await Organization.create({
      name: organizationName,
      slug,
      owner: owner._id,
      subscription: {
        plan: 'business',
        status: 'trialing',
        trialEndsAt
      },
      limits: {
        branches: 5, tables: 50, staff: 20, menuItems: 200, analyticsRetention: 30
      },
      features: {
        pdfReceipts: true, customBranding: true, inventory: true, employeeMetrics: true
      },
      settings: {
        currency: 'NPR', timezone: 'Asia/Kathmandu', taxRate: 13, serviceCharge: 10
      },
      isActive: true
    });

    // 3. Create default branch
    let branchCode = `${slug.substring(0, 3).toUpperCase()}-BR001`;
let branchCounter = 1;
while (await Branch.findOne({ code: branchCode })) {
  branchCounter++;
  branchCode = `${slug.substring(0, 3).toUpperCase()}-BR${String(branchCounter).padStart(3, '0')}`;
}

const branch = await Branch.create({
  organization: organization._id,
  name: 'Main Branch',
  code: branchCode,  // ✅ Guaranteed unique
  location: { country: 'Nepal' },
  isActive: true,
  settings: {
    autoAcceptOrders: true,
    allowReservations: false,
    printAutomatically: false
  }
});

    // 4. Update owner
    owner.organization = organization._id;
    owner.branches = [branch._id];
    await owner.save();

    // 5. Auto-create staff accounts (1 of each role)
    const staffRoles = [
      { role: 'admin',          prefix: 'admin' },
      { role: 'branch_manager', prefix: 'manager' },
      { role: 'waiter',         prefix: 'waiter' },
      { role: 'kitchen',        prefix: 'kitchen' }
    ];

    const generatedStaff = [];

    for (const staff of staffRoles) {
      const staffEmail = `${staff.prefix}@${emailDomain}`;
      
      // Skip if email already exists
      const exists = await User.findOne({ email: staffEmail });
      if (exists) continue;

      await User.create({
        organization: organization._id,
        branches: [branch._id],
        name: `${staff.prefix.charAt(0).toUpperCase() + staff.prefix.slice(1)}`,
        email: staffEmail,
        password: staffPassword,
        role: staff.role,
        isActive: true
      });

      generatedStaff.push({
        role: staff.role,
        email: staffEmail,
        password: staffPassword
      });
    }

    // 6. Subscription
    await Subscription.create({
      organization: organization._id,
      plan: 'business',
      status: 'trialing',
      provider: 'manual',
      billingCycle: 'monthly',
      amount: 0,
      currency: 'NPR',
      trialStart: new Date(),
      trialEnd: trialEndsAt
    });

    // 7. JWT
    const token = jwt.sign(
      { id: owner._id, role: owner.role, organization: organization._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const userResponse = await User.findById(owner._id)
      .populate('organization', 'name slug subscription limits features settings')
      .populate('branches', 'name code');

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to NUVLYX!',
      token,
      user: userResponse,
      generatedStaff  // ✅ Send staff credentials to owner
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// ============================================================
// POST /api/auth/login (existing)
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('organization', 'name slug subscription limits features settings')
      .populate('branches', 'name code');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const organizationId = user.organization?._id || user.organization || null;

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organization: organizationId
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
});

// ============================================================
// GET /api/auth/me (existing)
// ============================================================
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

module.exports = router;