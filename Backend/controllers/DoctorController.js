import User from '../Model/userModel.js';
import Appointment from '../Model/AppointmentModel.js';
import Patient from '../Model/patientModel.js';
import Prescription from '../Model/PrescriptionModel.js';
import Diagnosis from '../Model/DigonseModel.js';
import { GoogleGenAI } from "@google/genai";

// Lazy-load GoogleGenAI - instantiate only when needed
let ai = null;

const getAIClient = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  return ai;
};

// @desc    Get doctor dashboard
// @route   GET /api/doctor/dashboard
// @access  Private/Doctor
export const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow }
    }).populate('patient', 'name email');

    // Get total patients
    const totalPatients = await Prescription.distinct('patient', {
      doctor: doctorId
    });

    // Get upcoming appointments (next 7 days)
    const sevenDaysLater = new Date(today);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcomingAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: today, $lt: sevenDaysLater }
    }).populate('patient', 'name email phone');

    // Get recent prescriptions
    const recentPrescriptions = await Prescription.find({
      doctor: doctorId
    })
      .populate('patient', 'name email')
      .sort('-createdAt')
      .limit(10);

    // Get AI diagnosis history
    const diagnosisHistory = await Diagnosis.find({
      doctor: doctorId
    })
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      dashboard: {
        todayAppointmentsCount: todayAppointments.length,
        totalPatientsCount: totalPatients.length,
        upcomingAppointmentsCount: upcomingAppointments.length,
        todayAppointments,
        upcomingAppointments,
        recentPrescriptions,
        diagnosisHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor dashboard',
      error: error.message
    });
  }
};

// @desc    Get AI analysis for patient symptoms
// @route   POST /api/doctor/ai-analyze
// @access  Private/Doctor (Pro subscription required)
export const getAIAnalysis = async (req, res) => {
  try {
    const { symptoms, age, gender, medicalHistory, patientId } = req.body;

    // Check if user has Pro subscription
    if (req.user.subscriptionPlan !== 'pro') {
      return res.status(403).json({
        success: false,
        message: 'AI features require Pro subscription',
        fallback: true
      });
    }

    let aiResponse;
    let aiModelUsed = 'gemini';

    try {
      const prompt = `As a medical AI assistant, analyze these symptoms and provide possible conditions.
      
      Patient Information:
      - Symptoms: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}
      - Age: ${age}
      - Gender: ${gender}
      - Medical History: ${medicalHistory || 'None'}
      
      Please provide:
      1. Possible conditions (list top 3-5)
      2. Risk level for each (Low/Medium/High)
      3. Suggested diagnostic tests
      4. General recommendations
      5. When to refer to specialist
      
      Format the response in a clear, structured way suitable for a doctor to review.`;

      const result = await getAIClient().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      aiResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
    } catch (aiError) {
      console.error("AI Error:", aiError);
      aiResponse = `Unable to get AI analysis at the moment. Please try again later.
      Error: ${aiError.message}`;
      aiModelUsed = 'fallback';
    }

    // Save diagnosis log
    const diagnosisLog = await Diagnosis.create({
      patient: patientId || req.user._id,
      doctor: req.user._id,
      symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
      patientInfo: { age, gender },
      medicalHistory,
      aiResponse: { text: aiResponse },
      aiModelUsed,
      riskLevel: 'pending'
    });

    res.json({
      success: true,
      analysis: aiResponse,
      logId: diagnosisLog._id,
      modelUsed: aiModelUsed,
      note: 'This is an AI-generated suggestion. Please consult your clinical judgment.'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get AI analysis',
      error: error.message
    });
  }
};

// @desc    Get doctor's appointments for a specific date
// @route   GET /api/doctor/appointments/:date
// @access  Private/Doctor
export const getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const doctorId = req.user._id;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startDate, $lte: endDate }
    })
      .populate('patient', 'name email phone age')
      .sort('date');

    res.json({
      success: true,
      appointmentsCount: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
};

// @desc    Get doctor's patient list
// @route   GET /api/doctor/patients
// @access  Private/Doctor
export const getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const patients = await Prescription.distinct('patient', {
      doctor: doctorId
    });

    const patientDetails = await Patient.find({
      _id: { $in: patients }
    }).select('name email phone age gender medicalHistory');

    res.json({
      success: true,
      patientsCount: patientDetails.length,
      patients: patientDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: error.message
    });
  }
};

// @desc    Get patient medical history for doctor
// @route   GET /api/doctor/patient/:patientId/history
// @access  Private/Doctor
export const getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    const prescriptions = await Prescription.find({ patient: patientId })
      .sort('-createdAt');
    const appointments = await Appointment.find({ patient: patientId })
      .sort('-createdAt');
    const diagnoses = await Diagnosis.find({ patient: patientId })
      .sort('-createdAt');

    res.json({
      success: true,
      patientInfo: patient,
      prescriptions,
      appointments,
      diagnoses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient history',
      error: error.message
    });
  }
};

// @desc    Mark appointment as completed
// @route   PUT /api/doctor/appointment/:appointmentId/complete
// @access  Private/Doctor
export const completeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { notes, diagnosis, prescription } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: 'completed',
        notes,
        diagnosis,
        completedAt: new Date()
      },
      { new: true }
    ).populate('patient');

    res.json({
      success: true,
      message: 'Appointment marked as completed',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete appointment',
      error: error.message
    });
  }
};

// @desc    Get doctor's performance stats
// @route   GET /api/doctor/stats
// @access  Private/Doctor
export const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalAppointments = await Appointment.countDocuments({
      doctor: doctorId
    });

    const completedAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'completed'
    });

    const recentAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const totalPatients = await Prescription.distinct('patient', {
      doctor: doctorId
    });

    const prescriptionsCount = await Prescription.countDocuments({
      doctor: doctorId
    });

    res.json({
      success: true,
      statistics: {
        totalAppointments,
        completedAppointments,
        completionRate: ((completedAppointments / totalAppointments) * 100).toFixed(2) + '%',
        appointmentsLast30Days: recentAppointments,
        totalPatients: totalPatients.length,
        totalPrescriptions: prescriptionsCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor statistics',
      error: error.message
    });
  }
};
