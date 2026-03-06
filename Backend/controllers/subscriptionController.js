import User from '../Model/userModel.js';
import Patient from '../Model/patientModel.js';

// Subscription plans data
const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: {
      maxPatients: 100,
      maxDoctors: 1,
      maxReceptionists: 1,
      aiFeatures: false,
      advancedAnalytics: false,
      storage: 100 // MB
    }
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 4999, // PKR per month
    features: {
      maxPatients: 1000,
      maxDoctors: 5,
      maxReceptionists: 3,
      aiFeatures: true,
      advancedAnalytics: true,
      storage: 1024 // 1GB
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 14999, // PKR per month
    features: {
      maxPatients: 10000,
      maxDoctors: 20,
      maxReceptionists: 10,
      aiFeatures: true,
      advancedAnalytics: true,
      storage: 10240 // 10GB
    }
  }
];

// @desc    Get all subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
export const getPlans = async (req, res) => {
  try {
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user subscription
// @route   GET /api/subscriptions/current
// @access  Private
export const getCurrentSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const plan = plans.find(p => p.id === user.subscriptionPlan) || plans[0];
    
    // Calculate usage
    const patientsCount = await Patient.countDocuments({ 
      createdBy: user._id 
    });

    res.json({
      plan: user.subscriptionPlan,
      details: plan,
      usage: {
        patients: patientsCount,
        patientsLimit: plan.features.maxPatients
      },
      validUntil: user.subscriptionValidUntil || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upgrade subscription
// @route   PUT /api/subscriptions/upgrade
// @access  Private
export const upgradePlan = async (req, res) => {
  try {
    const { planId } = req.body;

    const validPlans = ['pro', 'enterprise'];
    if (!validPlans.includes(planId)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const user = await User.findById(req.user._id);

    // Check if already on this plan
    if (user.subscriptionPlan === planId) {
      return res.status(400).json({ message: 'Already on this plan' });
    }

    // Check if downgrading (not allowed in upgrade route)
    if (user.subscriptionPlan === 'enterprise' && planId === 'pro') {
      return res.status(400).json({ message: 'Use downgrade endpoint for downgrading' });
    }

    user.subscriptionPlan = planId;
    user.subscriptionValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save();

    const plan = plans.find(p => p.id === planId);

    res.json({
      success: true,
      message: `Upgraded to ${plan.name} plan`,
      plan: user.subscriptionPlan,
      validUntil: user.subscriptionValidUntil
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Downgrade subscription
// @route   PUT /api/subscriptions/downgrade
// @access  Private
export const downgradePlan = async (req, res) => {
  try {
    const { planId } = req.body;

    const validPlans = ['free', 'pro'];
    if (!validPlans.includes(planId)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    const user = await User.findById(req.user._id);

    // Check if already on this plan
    if (user.subscriptionPlan === planId) {
      return res.status(400).json({ message: 'Already on this plan' });
    }

    // Check if upgrading (not allowed in downgrade route)
    if (user.subscriptionPlan === 'free' && planId === 'pro') {
      return res.status(400).json({ message: 'Use upgrade endpoint for upgrading' });
    }

    user.subscriptionPlan = planId;
    user.subscriptionValidUntil = planId === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    const plan = plans.find(p => p.id === planId);

    res.json({
      success: true,
      message: `Downgraded to ${plan.name} plan`,
      plan: user.subscriptionPlan,
      validUntil: user.subscriptionValidUntil
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/cancel
// @access  Private
export const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.subscriptionPlan === 'free') {
      return res.status(400).json({ message: 'Already on free plan' });
    }

    user.subscriptionPlan = 'free';
    user.subscriptionValidUntil = null;
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled. You are now on Free plan.',
      plan: user.subscriptionPlan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invoice
// @route   GET /api/subscriptions/invoice/:id
// @access  Private
export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    // Simulated invoice data
    const invoice = {
      id,
      date: new Date(),
      customerName: user.name,
      customerEmail: user.email,
      plan: user.subscriptionPlan,
      amount: user.subscriptionPlan === 'pro' ? 4999 : user.subscriptionPlan === 'enterprise' ? 14999 : 0,
      status: 'paid',
      items: [
        {
          description: `${user.subscriptionPlan} Plan - Monthly Subscription`,
          quantity: 1,
          price: user.subscriptionPlan === 'pro' ? 4999 : user.subscriptionPlan === 'enterprise' ? 14999 : 0
        }
      ]
    };

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get billing history
// @route   GET /api/subscriptions/billing-history
// @access  Private
export const getBillingHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Simulated billing history
    const history = [
      {
        id: 'inv_001',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        plan: user.subscriptionPlan,
        amount: user.subscriptionPlan === 'pro' ? 4999 : user.subscriptionPlan === 'enterprise' ? 14999 : 0,
        status: 'paid'
      },
      {
        id: 'inv_002',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        plan: 'free',
        amount: 0,
        status: 'paid'
      }
    ];

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check feature access
// @route   POST /api/subscriptions/check-feature
// @access  Private
export const checkFeatureAccess = async (req, res) => {
  try {
    const { feature } = req.body;
    const user = await User.findById(req.user._id);

    const plan = plans.find(p => p.id === user.subscriptionPlan);

    let hasAccess = false;
    switch(feature) {
      case 'ai':
        hasAccess = plan.features.aiFeatures;
        break;
      case 'analytics':
        hasAccess = plan.features.advancedAnalytics;
        break;
      case 'storage':
        hasAccess = true; // Always have storage, just different limits
        break;
      default:
        hasAccess = false;
    }

    res.json({
      feature,
      hasAccess,
      plan: user.subscriptionPlan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};








