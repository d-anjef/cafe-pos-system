const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Organization = require('../models/Organization');
const Subscription = require('../models/Subscription');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Pricing configuration
const PLANS = {
  free: { price: 0, priceId: null },
  starter: { 
    monthly: { price: 29, priceId: 'price_starter_monthly' },
    yearly: { price: 290, priceId: 'price_starter_yearly' }
  },
  business: { 
    monthly: { price: 79, priceId: 'price_business_monthly' },
    yearly: { price: 790, priceId: 'price_business_yearly' }
  },
  enterprise: { 
    monthly: { price: 199, priceId: 'price_enterprise_monthly' },
    yearly: { price: 1990, priceId: 'price_enterprise_yearly' }
  }
};

// @route   POST /api/stripe/create-checkout-session
// @desc    Create Stripe checkout session
// @access  Private (Owner)
router.post('/create-checkout-session', protect, authorize('owner'), async (req, res) => {
  try {
    const { plan, billingCycle } = req.body; // 'starter', 'business', 'enterprise', 'monthly'/'yearly'

    if (!PLANS[plan] || plan === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    const organization = await Organization.findById(req.user.organization);

    // Create or retrieve Stripe customer
    let customerId = organization.subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: organization.name,
        metadata: {
          organizationId: organization._id.toString()
        }
      });
      customerId = customer.id;
      organization.subscription.stripeCustomerId = customerId;
      await organization.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PLANS[plan][billingCycle].priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/billing/cancel`,
      metadata: {
        organizationId: organization._id.toString(),
        plan,
        billingCycle
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create checkout session', 
      error: error.message 
    });
  }
});

// @route   POST /api/stripe/webhook
// @desc    Handle Stripe webhooks
// @access  Public (Stripe only)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook handlers
async function handleCheckoutCompleted(session) {
  const { organizationId, plan, billingCycle } = session.metadata;
  
  const organization = await Organization.findById(organizationId);
  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription);

  // Update organization
  organization.subscription.plan = plan;
  organization.subscription.status = 'active';
  organization.subscription.stripeSubscriptionId = stripeSubscription.id;
  organization.subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
  organization.subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
  organization.subscription.paymentMethod = 'stripe';

  // Update limits based on plan
  const limits = {
    starter: { branches: 1, tables: 100, staff: 10, menuItems: 100, analyticsRetention: 30 },
    business: { branches: 5, tables: 500, staff: 50, menuItems: 500, analyticsRetention: 365 },
    enterprise: { branches: 999, tables: 9999, staff: 999, menuItems: 9999, analyticsRetention: 9999 }
  };
  organization.limits = limits[plan];

  // Update features
  const features = {
    starter: { pdfReceipts: true, qrOrdering: false, customBranding: false, apiAccess: false, prioritySupport: false, multiCurrency: false, inventory: false, employeeMetrics: false },
    business: { pdfReceipts: true, qrOrdering: true, customBranding: true, apiAccess: false, prioritySupport: true, multiCurrency: false, inventory: true, employeeMetrics: true },
    enterprise: { pdfReceipts: true, qrOrdering: true, customBranding: true, apiAccess: true, prioritySupport: true, multiCurrency: true, inventory: true, employeeMetrics: true }
  };
  organization.features = features[plan];

  await organization.save();

  // Update subscription record
  await Subscription.findOneAndUpdate(
    { organization: organizationId },
    {
      plan,
      status: 'active',
      provider: 'stripe',
      providerSubscriptionId: stripeSubscription.id,
      billingCycle,
      amount: PLANS[plan][billingCycle].price,
      currency: 'USD',
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      $push: {
        paymentHistory: {
          date: new Date(),
          amount: PLANS[plan][billingCycle].price,
          status: 'succeeded',
          method: 'stripe',
          transactionId: session.payment_intent
        }
      }
    },
    { upsert: true }
  );

  console.log(`✅ Subscription activated for organization: ${organizationId}`);
}

async function handleSubscriptionUpdated(subscription) {
  const organization = await Organization.findOne({ 
    'subscription.stripeSubscriptionId': subscription.id 
  });

  if (organization) {
    organization.subscription.status = subscription.status;
    organization.subscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    organization.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    await organization.save();

    await Subscription.findOneAndUpdate(
      { organization: organization._id },
      {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    );
  }
}

async function handleSubscriptionDeleted(subscription) {
  const organization = await Organization.findOne({ 
    'subscription.stripeSubscriptionId': subscription.id 
  });

  if (organization) {
    organization.subscription.status = 'canceled';
    organization.subscription.plan = 'free';
    await organization.save();

    await Subscription.findOneAndUpdate(
      { organization: organization._id },
      { 
        status: 'canceled',
        canceledAt: new Date()
      }
    );
  }
}

async function handlePaymentSucceeded(invoice) {
  const subscription = await Subscription.findOne({ 
    providerSubscriptionId: invoice.subscription 
  });

  if (subscription) {
    subscription.paymentHistory.push({
      date: new Date(),
      amount: invoice.amount_paid / 100,
      status: 'succeeded',
      method: 'stripe',
      invoiceUrl: invoice.hosted_invoice_url,
      transactionId: invoice.payment_intent
    });
    await subscription.save();
  }
}

async function handlePaymentFailed(invoice) {
  const organization = await Organization.findOne({ 
    'subscription.stripeSubscriptionId': invoice.subscription 
  });

  if (organization) {
    organization.subscription.status = 'past_due';
    await organization.save();

    await Subscription.findOneAndUpdate(
      { organization: organization._id },
      { status: 'past_due' }
    );
  }
}

// @route   POST /api/stripe/cancel-subscription
// @desc    Cancel subscription
// @access  Private (Owner)
router.post('/cancel-subscription', protect, authorize('owner'), async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);

    if (!organization.subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'No active Stripe subscription found'
      });
    }

    await stripe.subscriptions.update(
      organization.subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    organization.subscription.status = 'canceled';
    await organization.save();

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to cancel subscription', 
      error: error.message 
    });
  }
});

// @route   GET /api/stripe/billing-portal
// @desc    Get Stripe billing portal URL
// @access  Private (Owner)
router.get('/billing-portal', protect, authorize('owner'), async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);

    if (!organization.subscription.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'No Stripe customer found'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: organization.subscription.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/billing`
    });

    res.json({
      success: true,
      url: session.url
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to create billing portal session', 
      error: error.message 
    });
  }
});

module.exports = router;
