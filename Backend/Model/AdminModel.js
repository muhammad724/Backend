import User from '../Model/userModel.js';
import Patient from '../Model/patientModel.js';
import Appointment from '../Model/AppointmentModel.js';
import Prescription from '../Model/PrescriptionModel.js';

export const getAdminStats = async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({ role: 'Doctor' });
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    const proUsers = await User.countDocuments({ subscriptionPlan: 'Pro' });
    const simulatedRevenue = proUsers * 50;

    const diagnosisStats = await Prescription.aggregate([
      { $group: { _id: "$diagnosis", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        simulatedRevenue,
        diagnosisStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin stats", error });
  }
};