import Prescription from '../Model/PrescriptionModel.js';
import Patient from '../Model/patientModel.js';
import Appointment from '../Model/AppointmentModel.js';
import DiagnosisLog from '../Model/DigonseModel.js';

// @desc    Create patient
// @route   POST /api/patients
// @access  Private (Admin, Receptionist, Doctor)
export const createPatient = async (req, res) => {
  try {
    // prevent duplicate patients by email or contact
    const { email, contact } = req.body;
    if (email) {
      const existing = await Patient.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: 'Patient with this email already exists' });
      }
    }
    if (contact) {
      const existing = await Patient.findOne({ contact });
      if (existing) {
        return res.status(400).json({ message: 'Patient with this contact number already exists' });
      }
    }

    const patient = await Patient.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json(patient);
  } catch (error) {
    // handle duplicate key errors from unique index as well
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Patient already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
export const getPatients = async (req, res) => {
  try {
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'doctor') {
      // Doctors see patients they've treated
      const appointments = await Appointment.find({ 
        doctor: req.user._id 
      }).distinct('patient');
      query._id = { $in: appointments };
    }

    const patients = await Patient.find(query)
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // enforce access rules
    if (req.user.role === 'doctor') {
      // verify doctor has worked with this patient
      const seen = await Appointment.exists({
        doctor: req.user._id,
        patient: patient._id
      });
      const wrote = await Prescription.exists({
        doctor: req.user._id,
        patient: patient._id
      });
      if (!seen && !wrote) {
        return res.status(403).json({ message: 'Not authorized to view this patient' });
      }
    }

    if (req.user.role === 'patient') {
      const my = await Patient.findOne({ email: req.user.email });
      if (!my || my._id.toString() !== patient._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view another patient' });
      }
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
export const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private/Admin
export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient medical history
// @route   GET /api/patients/:id/history
// @access  Private
export const getPatientHistory = async (req, res) => {
  try {
    const patientId = req.params.id;

    // enforce access
    if (req.user.role === 'doctor') {
      const seen = await Appointment.exists({
        doctor: req.user._id,
        patient: patientId
      });
      const wrote = await Prescription.exists({
        doctor: req.user._id,
        patient: patientId
      });
      if (!seen && !wrote) {
        return res.status(403).json({ message: 'Not authorized to view this history' });
      }
    }
    if (req.user.role === 'patient') {
      const my = await Patient.findOne({ email: req.user.email });
      if (!my || my._id.toString() !== patientId) {
        return res.status(403).json({ message: 'Not authorized to view another patient' });
      }
    }

    // Get all appointments
    const appointments = await Appointment.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .sort('-date');

    // Get all prescriptions
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'name')
      .sort('-createdAt');

    // Get diagnosis logs
    const diagnosisLogs = await DiagnosisLog.find({ patient: patientId })
      .sort('-createdAt');

    res.json({
      patient: await Patient.findById(patientId),
      appointments,
      prescriptions,
      diagnosisLogs,
      summary: {
        totalAppointments: appointments.length,
        totalPrescriptions: prescriptions.length,
        lastVisit: appointments[0]?.date || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add medical history entry
// @route   POST /api/patients/:id/history
// @access  Private/Doctor
export const addMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const historyEntry = {
      condition: req.body.condition,
      diagnosedDate: req.body.diagnosedDate || Date.now(),
      notes: req.body.notes
    };

    patient.medicalHistory.push(historyEntry);
    await patient.save();

    res.status(201).json(patient.medicalHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------------------
// Helper endpoints for the logged-in patient
// -------------------------------------------------------------

// @desc    Get current patient's profile
// @route   GET /api/patients/me
// @access  Private/Patient
export const getMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ email: req.user.email });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update current patient's profile
// @route   PUT /api/patients/me
// @access  Private/Patient
export const updateMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { email: req.user.email },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};