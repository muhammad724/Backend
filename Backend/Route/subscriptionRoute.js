import express from 'express';
import {
  getPlans,
  getCurrentSubscription,
  upgradePlan,
  downgradePlan,
  cancelSubscription,
  getInvoice,
  getBillingHistory,
  checkFeatureAccess
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/plans', getPlans);

// Protected routes
router.use(protect);

router.get('/current', getCurrentSubscription);
router.put('/upgrade', upgradePlan);
router.put('/downgrade', downgradePlan);
router.put('/cancel', cancelSubscription);
router.get('/invoice/:id', getInvoice);
router.get('/billing-history', getBillingHistory);
router.post('/check-feature', checkFeatureAccess);

export default router;
