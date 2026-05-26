const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const Organization = require('../models/Organization');
const Subscription = require('../models/Subscription');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// eSewa Configuration
const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID,
  successUrl: `${process.env.CLIENT_URL}/billing/esewa/success`,
  failureUrl: `${process.env.CLIENT_URL}/billing/esewa/failure`,
  paymentUrl: 'https://uat.esewa.com.np/epay/main' // Use production URL in prod
};

// Khalti Configuration
const KHALTI_CONFIG = {
  secretKey: process.env.KHALTI_SECRET_KEY,
  publicKey: process.env.KHALTI_PUBLIC_KEY,
  verifyUrl: 'https://khalti.com/api/v2/payment/verify/'
};

// @route   POST /api/local-payments/esewa/initiate
// @desc    Initiate eSewa payment
// @access  Private (Owner)
router.post('/esewa/initiate', protect, authorize('owner'), async (req, res) => {
  try {
    const { plan, billingCycle } = req.body;

    const plans = {
      starter: { monthly: 2900, yearly: 29000 }, // NPR (1 USD ≈ 100 NPR)
      business: { monthly: 7900, yearly: 79000 },
      enterprise: { monthly: 19900, yearly: 199000 }
    };

    const amount = plans[plan][billingCycle];
    const organization = await Organization.findById(req.user.organization);

    const paymentData = {
      amt: amount,
      psc: 0, // Service charge
      pdc: 0, // Delivery charge
      txAmt: 0, // Tax amount
      tAmt: amount, // Total amount
      pid: `ORG-${organization._id}-${Date.now()}`, // Unique product ID
      scd: ESEWA_CONFIG.merchantId,
      su: ESEWA_CONFIG.successUrl,
      fu: ESEWA_CONFIG.failureUrl
    };

    // Store pending subscription info
    await Subscription.findOneAndUpdate(
      { organization: organization._id },
      {
        $set: {
          'pendingPayment': {
            plan,
            billingCycle,
            amount,
            provider: 'esewa',
            productId: paymentData.pid,
            createdAt: new Date()
          }
        }
      },
      { upsert: true }
    );

    res.json({
      success: true,
      paymentUrl: ESEWA_CONFIG.paymentUrl,
      paymentData
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to initiate eSewa payment', 
      error: error.message 
    });
  }
});

// @route   POST /api/local-payments/esewa/verify
// @desc    Verify eSewa payment
// @access  Public
router.post('/esewa/verify', async (req, res) => {
  try {
    const { oid, amt, refId } = req.body;

    // Verify payment with eSewa
    const verifyUrl = `https://uat.esewa.com.np/epay/transrec`;
    const verifyData = {
      amt,
      rid: refId,
      pid: oid,
      scd: ESEWA_CONFIG.merchantId
    };

    const response = await axios.post(verifyUrl, null, { params: verifyData });

    if (response.data.includes('Success')) {
      // Extract organization ID from product ID
      const orgId = oid.split('-')[1];
      
      const subscription = await Subscription.findOne({ organization: orgId });
      const { plan, billingCycle, amount } = subscription.pendingPayment;

      // Update organization
      const organization = await Organization.findById(orgId);
      organization.subscription.plan = plan;
      organization.subscription.status = 'active';
      organization.subscription.paymentMethod = 'esewa';
      organization.subscription.currentPeriodStart = new Date();
      
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));
      organization.subscription.currentPeriodEnd = periodEnd;
      
      await organization.save();

      // Update subscription
      subscription.status = 'active';
      subscription.provider = 'esewa';
      subscription.plan = plan;
      subscription.billingCycle = billingCycle;
      subscription.amount = amount;
      subscription.currentPeriodStart = new Date();
      subscription.currentPeriodEnd = periodEnd;
      subscription.paymentHistory.push({
        date: new Date(),
        amount,
        status: 'succeeded',
        method: 'esewa',
        transactionId: refId
      });
      subscription.pendingPayment = undefined;
      await subscription.save();

      res.json({
        success: true,
        message: 'Payment verified successfully'
      });

    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Payment verification error', 
      error: error.message 
    });
  }
});

// @route   POST /api/local-payments/khalti/verify
// @desc    Verify Khalti payment
// @access  Public
router.post('/khalti/verify', async (req, res) => {
  try {
    const { token, amount, organizationId, plan, billingCycle } = req.body;

    // Verify with Khalti
    const response = await axios.post(
      KHALTI_CONFIG.verifyUrl,
      {
        token,
        amount: amount * 100 // Convert to paisa
      },
      {
        headers: {
          'Authorization': `Key ${KHALTI_CONFIG.secretKey}`
        }
      }
    );

    if (response.data.state.name === 'Completed') {
      // Update organization
      const organization = await Organization.findById(organizationId);
      organization.subscription.plan = plan;
      organization.subscription.status = 'active';
      organization.subscription.paymentMethod = 'khalti';
      organization.subscription.currentPeriodStart = new Date();
      
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));
      organization.subscription.currentPeriodEnd = periodEnd;
      
      await organization.save();

      // Update subscription
      await Subscription.findOneAndUpdate(
        { organization: organizationId },
        {
          status: 'active',
          provider: 'khalti',
          plan,
          billingCycle,
          amount,
          currentPeriodStart: new Date(),
          currentPeriodEnd: periodEnd,
          $push: {
            paymentHistory: {
              date: new Date(),
              amount,
              status: 'succeeded',
              method: 'khalti',
              transactionId: response.data.idx
            }
          }
        },
        { upsert: true }
      );

      res.json({
        success: true,
        message: 'Payment verified successfully'
      });

    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Payment verification error', 
      error: error.message 
    });
  }
});

module.exports = router;
