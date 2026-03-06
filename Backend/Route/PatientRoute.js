import express from 'express';
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientHistory,
  getMyPatientProfile,
  updateMyPatientProfile
} from '../controllers/PatientControllers.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by multiple roles
router.route('/')
  .post(authorize('admin', 'receptionist', 'doctor'), createPatient)
  .get(authorize('admin', 'doctor', 'receptionist'), getPatients);

router.get('/history/:id', authorize('doctor', 'patient'), getPatientHistory);

// endpoints for the logged-in patient
router.get('/me', authorize('patient'), getMyPatientProfile);
router.put('/me', authorize('patient'), updateMyPatientProfile);

router.route('/:id')
  .get(authorize('admin', 'doctor', 'receptionist', 'patient'), getPatientById)
  .put(authorize('admin', 'receptionist', 'doctor'), updatePatient)
  .delete(authorize('admin'), deletePatient);

export default router;