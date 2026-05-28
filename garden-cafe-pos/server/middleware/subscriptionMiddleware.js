const Subscription = require('../models/Subscription');
const { getTrialInfo } = require('../services/trialService');

/**
 * Middleware that blocks WRITE operations (POST/PUT/DELETE/PATCH)
 * when the organization is in grace period (read-only mode).
 *
 * GET requests are always allowed (read-only).
 *
 * Order settlement is exception — allows POS to close existing orders.
 */
exports.enforceReadOnly = async (req, res, next) => {
  try {
    // Super admin bypass
    if (req.user?.role === 'super_admin') return next();

    // Only check write operations
    const writeMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);
    if (!writeMethod) return next();

    // Get user's organization
    const orgId = req.user?.organization?._id || req.user?.organization;
    if (!orgId) return next();

    // Get trial info
    const trialInfo = await getTrialInfo(orgId);
    if (!trialInfo) return next();

    // Only block if in grace period
    if (trialInfo.status !== 'grace') return next();

    // EXCEPTION: Allow order settlement and payment-related routes
    const allowedRoutes = [
      /^\/api\/orders\/.+\/settle$/,           // Settle existing order
      /^\/api\/orders\/.+\/payment$/,           // Add payment to order
      /^\/api\/billing\//,                      // All billing routes (so they can upgrade!)
      /^\/api\/local-payments\//,               // Payment processing
      /^\/api\/auth\/logout$/                   // Allow logout
    ];

    const isAllowed = allowedRoutes.some(pattern => pattern.test(req.originalUrl));
    if (isAllowed) return next();

    // BLOCK with helpful message
    return res.status(402).json({
      success: false,
      code: 'TRIAL_EXPIRED',
      message: 'Your trial has ended. Please upgrade to continue.',
      details: {
        status: 'grace_period',
        daysLeftInGrace: trialInfo.daysLeft,
        upgradeUrl: '/admin?tab=billing'
      }
    });

  } catch (err) {
    console.error('subscriptionMiddleware error:', err);
    // Don't block on error — fail open
    next();
  }
};

/**
 * Middleware that adds trial info to req for any route that wants it
 */
exports.attachTrialInfo = async (req, res, next) => {
  try {
    if (req.user?.role === 'super_admin') return next();

    const orgId = req.user?.organization?._id || req.user?.organization;
    if (!orgId) return next();

    req.trialInfo = await getTrialInfo(orgId);
    next();
  } catch (err) {
    next();
  }
};