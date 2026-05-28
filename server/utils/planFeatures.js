// ============================================================
// SINGLE SOURCE OF TRUTH for plans, features, and limits
// ============================================================

const PLAN_PRICING = {
  free:       { monthly: 0,    yearly: 0      },
  starter:    { monthly: 999,  yearly: 9590   },
  business:   { monthly: 2999, yearly: 28790  },
  enterprise: { monthly: 9999, yearly: 95990  }
};

const PLAN_NAMES = {
  free:       "Free",
  starter:    "Starter",
  business:   "Business",
  enterprise: "Enterprise"
};

const PLAN_LIMITS = {
  free:       { branches: 1,   tables: 5,   staff: 3,   menuItems: 20,   analyticsRetention: 7   },
  starter:    { branches: 1,   tables: 15,  staff: 5,   menuItems: 50,   analyticsRetention: 30  },
  business:   { branches: 5,   tables: 50,  staff: 20,  menuItems: 200,  analyticsRetention: 90  },
  enterprise: { branches: 20,  tables: 200, staff: 100, menuItems: 1000, analyticsRetention: 365 }
};

const PLAN_FEATURES = {
  free: {
    qrOrdering:      false,
    pdfReceipts:     false,
    customBranding:  false,
    multiCurrency:   false,
    inventory:       false,
    employeeMetrics: false,
    apiAccess:       false,
    prioritySupport: false
  },
  starter: {
    qrOrdering:      true,
    pdfReceipts:     true,
    customBranding:  false,
    multiCurrency:   false,
    inventory:       false,
    employeeMetrics: false,
    apiAccess:       false,
    prioritySupport: false
  },
  business: {
    qrOrdering:      true,
    pdfReceipts:     true,
    customBranding:  true,
    multiCurrency:   true,
    inventory:       true,
    employeeMetrics: true,
    apiAccess:       false,
    prioritySupport: true
  },
  enterprise: {
    qrOrdering:      true,
    pdfReceipts:     true,
    customBranding:  true,
    multiCurrency:   true,
    inventory:       true,
    employeeMetrics: true,
    apiAccess:       true,
    prioritySupport: true
  }
};

// ============================================================
// HELPERS
// ============================================================

function getAllPlans() {
  const plans = {};
  for (const planKey of Object.keys(PLAN_PRICING)) {
    plans[planKey] = {
      name:     PLAN_NAMES[planKey],
      monthly:  PLAN_PRICING[planKey].monthly,
      yearly:   PLAN_PRICING[planKey].yearly,
      limits:   PLAN_LIMITS[planKey],
      features: PLAN_FEATURES[planKey]
    };
  }
  return plans;
}

function getPlanPrice(plan, billingCycle = "monthly") {
  if (!PLAN_PRICING[plan]) return 0;
  return PLAN_PRICING[plan][billingCycle === "yearly" ? "yearly" : "monthly"];
}

function applyPlanToOrg(organization, newPlan) {
  if (!PLAN_FEATURES[newPlan]) {
    throw new Error(`Unknown plan: ${newPlan}`);
  }

  if (!organization.subscription) organization.subscription = {};

  organization.subscription.plan = newPlan;
  organization.features = { ...PLAN_FEATURES[newPlan] };
  organization.limits   = { ...PLAN_LIMITS[newPlan] };

  return organization;
}

function planHasFeature(plan, feature) {
  return PLAN_FEATURES[plan]?.[feature] === true;
}

module.exports = {
  PLAN_PRICING,
  PLAN_NAMES,
  PLAN_LIMITS,
  PLAN_FEATURES,
  getAllPlans,
  getPlanPrice,
  applyPlanToOrg,
  planHasFeature
};