import express from 'express';
import { 
  getDoctorDashboard,
  getAIAnalysis,
  getAppointmentsByDate,
  getDoctorPatients,
  getPatientMedicalHistory,
  completeAppointment,
  getDoctorStats
} from '../controllers/DoctorController.js';
import { createPrescription } from '../controllers/presciptionControllers.js';
import { protect, authorize } from '../middleware/auth.js';
import { checkSubscription } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('doctor', 'Doctor'));

// Dashboard and stats
router.get('/dashboard', getDoctorDashboard);
router.get('/stats', getDoctorStats);

// Patients
router.get('/patients', getDoctorPatients);
router.get('/patient/:patientId/history', getPatientMedicalHistory);

// Appointments
router.get('/appointments/:date', getAppointmentsByDate);
router.put('/appointment/:appointmentId/complete', completeAppointment);

// Prescriptions
router.post('/prescription', createPrescription);

// AI FEATURE: Smart Symptom Checker (Requires Pro Plan)
router.post('/ai-analyze', checkSubscription('pro'), getAIAnalysis);

export default router;