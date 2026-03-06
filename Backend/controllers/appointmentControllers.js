import User from '../Model/userModel.js';
import Patient from '../Model/patientModel.js';
import Appointment from '../Model/AppointmentModel.js';

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, timeSlot, symptoms, type } = req.body;

    // if a patient is making the request, ensure they book for themselves
    if (req.user.role === 'patient') {
      const me = await Patient.findOne({ email: req.user.email });
      if (!me) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      if (me._id.toString() !== patient) {
        return res.status(403).json({ message: 'Patients can only book their own appointments' });
      }
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      'timeSlot.start': timeSlot?.start,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      date,
      timeSlot,
      symptoms,
      type,
      createdBy: req.user._id
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name contact email')
      .populate('doctor', 'name specialization')
      .populate('createdBy', 'name role');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ email: req.user.email });
      if (patient) {
        query.patient = patient._id;
      }
    }

    // Date filtering
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(req.query.date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Status filtering
    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name age contact')
      .populate('doctor', 'name specialization')
      .populate('createdBy', 'name role')
      .sort('-date');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor', 'name specialization email')
      .populate('createdBy', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: req.body.status,
        notes: req.body.notes,
        timeSlot: req.body.timeSlot,
        date: req.body.date
      },
      { new: true }
    )
      .populate('patient', 'name')
      .populate('doctor', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Admin
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor schedule
// @route   GET /api/appointments/doctor/:doctorId/schedule
// @access  Private
export const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' }
    })
      .populate('patient', 'name age contact')
      .sort('timeSlot.start');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my appointments (for patients)
// @route   GET /api/appointments/my-appointments
// @access  Private/Patient
export const getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ email: req.user.email });

    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const appointments = await Appointment.find({ patient: patient._id })
      .populate('doctor', 'name specialization')
      .sort('-date');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private/Doctor
export const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    );

    res.json({ message: 'Appointment confirmed', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        cancellationReason: reason 
      },
      { new: true }
    );

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private/Doctor
export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );

    res.json({ message: 'Appointment completed', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};