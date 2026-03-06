import express from 'express';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getPatientPrescriptions,
  generatePrescriptionPDF,
  addMedicine,
  removeMedicine,
  addTest
} from '../controllers/presciptionControllers.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Patient's prescriptions
router.get('/patient/:patientId', getPatientPrescriptions);

// PDF generation
router.get('/:id/pdf', generatePrescriptionPDF);

// Medicine management
router.post('/:id/medicines', authorize('doctor'), addMedicine);
router.delete('/:id/medicines/:medicineId', authorize('doctor'), removeMedicine);

// Test management
router.post('/:id/tests', authorize('doctor'), addTest);

// Main routes
router.route('/')
  .post(authorize('doctor'), createPrescription)
  .get(authorize('admin', 'doctor', 'patient'), getPrescriptions);

router.route('/:id')
  .get(authorize('admin', 'doctor', 'patient'), getPrescriptionById)
  .put(authorize('doctor'), updatePrescription)
  .delete(authorize('admin'), deletePrescription);

export default router;