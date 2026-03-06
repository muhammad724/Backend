import express from 'express';
import {
  getAdminDashboardStats,
  getDoctorDashboardStats,
  getRevenueAnalytics,
  getPatientAnalytics,
  getAppointmentAnalytics,
  getPrescriptionAnalytics,
  getMonthlyReport,
  getDailyStats,
  getTopDiagnosis,
  getDoctorPerformance,
  getPatientDashboardStats,
  getReceptionistDashboardStats
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin analytics
router.get('/admin/dashboard', 
  authorize('admin'), 
  getAdminDashboardStats
);

router.get('/admin/revenue', 
  authorize('admin'), 
  getRevenueAnalytics
);

router.get('/admin/patients', 
  authorize('admin'), 
  getPatientAnalytics
);

router.get('/admin/appointments', 
  authorize('admin'), 
  getAppointmentAnalytics
);

router.get('/admin/prescriptions', 
  authorize('admin'), 
  getPrescriptionAnalytics
);

router.get('/admin/top-diagnosis', 
  authorize('admin'), 
  getTopDiagnosis
);

router.get('/admin/doctor-performance', 
  authorize('admin'), 
  getDoctorPerformance
);

router.get('/admin/monthly-report', 
  authorize('admin'), 
  getMonthlyReport
);

// Doctor analytics
router.get('/doctor/dashboard', 
  authorize('doctor'), 
  getDoctorDashboardStats
);

router.get('/doctor/daily-stats', 
  authorize('doctor'), 
  getDailyStats
);

// Patient analytics
router.get('/patient/dashboard', 
  authorize('patient'), 
  getPatientDashboardStats
);

// Receptionist analytics
router.get('/receptionist/dashboard', 
  authorize('receptionist'), 
  getReceptionistDashboardStats
);

export default router;