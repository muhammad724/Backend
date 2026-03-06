import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getDoctorSchedule,
  getMyAppointments,
  cancelAppointment,
  confirmAppointment,
  completeAppointment
} from '../controllers/appointmentControllers.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Patient's own appointments
router.get('/my-appointments', authorize('patient'), getMyAppointments);

// Doctor's schedule
router.get('/doctor-schedule/:doctorId', authorize('doctor', 'admin', 'receptionist'), getDoctorSchedule);

// Main routes
router.route('/')
  .post(authorize('admin', 'receptionist', 'patient'), createAppointment)
  .get(authorize('admin', 'doctor', 'receptionist'), getAppointments);

// Status update routes
router.put('/:id/confirm', authorize('admin', 'doctor'), confirmAppointment);
router.put('/:id/cancel', authorize('admin', 'doctor', 'receptionist', 'patient'), cancelAppointment);
router.put('/:id/complete', authorize('doctor'), completeAppointment);

// Single appointment routes
router.route('/:id')
  .get(authorize('admin', 'doctor', 'receptionist', 'patient'), getAppointmentById)
  .put(authorize('admin', 'doctor', 'receptionist'), updateAppointment)
  .delete(authorize('admin'), deleteAppointment);

export default router;