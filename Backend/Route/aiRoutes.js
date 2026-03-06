import express from 'express';
import {
  checkSymptoms,
  explainPrescription,
  detectRisks,
  getPredictiveAnalytics,
  getAIDiagnosisHistory,
  getRiskFlags
} from '../controllers/aiAnalytics.js';
import { protect, authorize, checkSubscription } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// AI Features - All require Pro subscription
router.post('/symptom-checker', 
  authorize('doctor'), 
  checkSubscription('pro'), 
  checkSymptoms
);

router.post('/explain-prescription', 
  authorize('doctor', 'patient'), 
  checkSubscription('pro'), 
  explainPrescription
);

router.get('/risk-flags/:patientId', 
  authorize('doctor'), 
  checkSubscription('pro'), 
  detectRisks
);

router.get('/predictive-analytics', 
  authorize('admin', 'doctor'), 
  checkSubscription('pro'), 
  getPredictiveAnalytics
);

// History and logs
router.get('/diagnosis-history', 
  authorize('doctor'), 
  getAIDiagnosisHistory
);

router.get('/risk-flags', 
  authorize('doctor', 'admin'), 
  getRiskFlags
);

export default router;