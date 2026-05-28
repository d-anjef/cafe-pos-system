const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getTrialInfo } = require('../services/trialService');
const { runTrialNow } = require('../cron/trialCron');

// ============================================================
// GET /api/trial/info — Get current org's trial status
// ============================================================
router.get('/info', protect, async (req, res) => {
  try {
    if (req.user.role === 'super_admin') {
      return res.json({ status: 'super_admin', isTrialing: false });
    }

    const orgId = req.user?.organization?._id || req.user?.organization;
    if (!orgId) {
      return res.json({ status: 'unknown', isTrialing: false });
    }

    const info = await getTrialInfo(orgId);
    res.json(info || { status: 'unknown', isTrialing: false });
  } catch (err) {
    console.error('GET /trial/info error:', err);
    res.status(500).json({ message: 'Failed to get trial info' });
  }
});

// ============================================================
// POST /api/trial/run-now — Super admin only manual trigger
// ============================================================
router.post('/run-now', protect, authorize('super_admin'), async (req, res) => {
  try {
    console.log(`[TRIAL] Manual trigger by ${req.user.email}`);
    const result = await runTrialNow();
    res.json({
      success: true,
      message: 'Trial processing completed',
      result
    });
  } catch (err) {
    console.error('POST /trial/run-now error:', err);
    res.status(500).json({ message: err.message || 'Failed to run' });
  }
});

module.exports = router;