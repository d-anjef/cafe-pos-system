const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Protect routes - verify JWT token
 * @access  Private
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID
      const user = await User.findById(decoded.id)
        .populate('organization', 'name slug subscription limits features settings')
        .populate('branches', 'name code');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Attach user to request object
      req.user = user;
      req.userId = decoded.id;
      req.organizationId = decoded.organization;

      // Super admin bypass
      if (user.role === "super_admin") {
        return next();
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid',
        error: error.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * @desc    Authorize specific user roles
 * @param   {...args} roles - Allowed roles (e.g., 'admin', 'manager', 'staff')
 * @access  Private
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route. Allowed roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * @desc    Verify user owns the resource
 * @param   resourceField - Field name containing user ID (e.g., 'userId', 'ownerId')
 * @access  Private
 */
exports.verifyOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const resourceOwnerId = req.body[resourceField] || req.params[resourceField];

    if (resourceOwnerId && resourceOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * @desc    Check if user has required subscription features
 * @param   ...features - Required features (e.g., 'analytics', 'inventory')
 * @access  Private
 */
exports.checkSubscriptionFeature = (...features) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const userFeatures = req.user.organization?.features || {};

    const hasRequiredFeatures = features.every(
      feature => userFeatures[feature] === true
    );

    if (!hasRequiredFeatures) {
      return res.status(403).json({
        success: false,
        message: 'Your subscription does not include this feature'
      });
    }

    next();
  };
};

/**
 * @desc    Verify branch ownership
 * @access  Private
 */
exports.verifyBranchAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const branchId = req.params.branchId || req.body.branchId;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID is required'
      });
    }

    if (['owner', 'admin', 'super_admin'].includes(req.user.role)) {
      req.branchId = branchId;
      return next();
    }

    // Check if user has access to this branch
    const hasAccess = req.user.branches.some(
      branch => branch._id.toString() === branchId.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this branch'
      });
    }

    req.branchId = branchId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Branch verification error',
      error: error.message
    });
  }
};

/**
 * @desc    Verify organization ownership
 * @access  Private
 */
exports.verifyOrganizationAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const organizationId = req.params.organizationId || req.body.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    // Check if user's organization matches
    if (req.user.organization._id.toString() !== organizationId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this organization'
      });
    }

    req.organizationId = organizationId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Organization verification error',
      error: error.message
    });
  }
};

/**
 * @desc    Check if user role is admin (for super admin operations)
 * @access  Private
 */
exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

/**
 * @desc    Check if user role is manager or admin
 * @access  Private
 */
exports.requireManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Manager or Admin access required'
    });
  }

  next();
};

/**
 * @desc  Shorthand role groups for reuse
 */
exports.ROLES = {
  ALL_STAFF: ['super_admin', 'owner', 'admin', 'branch_manager', 'waiter', 'kitchen'],
  MANAGEMENT: ['super_admin', 'owner', 'admin', 'branch_manager'],
  ADMIN_UP: ['super_admin', 'owner', 'admin'],
  OWNER_UP: ['super_admin', 'owner'],
  SUPER_ONLY: ['super_admin'],
};