import express from "express";
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Todo: Import receptionistController functions
// const { addPatient, getPatients, bookAppointment } = require('../controllers/receptionistModel');

router.use(protect);

// router.post('/patients', authorize('receptionist', 'admin'), addPatient);
// router.get('/patients', getPatients);
// router.post('/appointments', authorize('receptionist', 'patient'), bookAppointment);

export default router;