import Patient from '../Model/patientModel.js';
import Appointment from '../Model/AppointmentModel.js';
import Prescription from '../Model/PrescriptionModel.js';
import User from '../Model/userModel.js';
import Diagnosis from '../Model/DigonseModel.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/analytics/admin/dashboard
// @access  Private/Admin
export const getAdminDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalPatients,
      totalDoctors,
      totalReceptionists,
      totalAppointments,
      monthlyAppointments,
      yearlyAppointments,
      totalPrescriptions,
      recentAppointments,
      recentPatients
    ] = await Promise.all([
      Patient.countDocuments(),
      User.countDocuments({ role: 'doctor', isActive: true }),
      User.countDocuments({ role: 'receptionist', isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ date: { $gte: firstDayOfMonth } }),
      Appointment.countDocuments({ date: { $gte: firstDayOfYear } }),
      Prescription.countDocuments(),
      Appointment.find()
        .populate('patient', 'name')
        .populate('doctor', 'name')
        .sort('-date')
        .limit(5),
      Patient.find().sort('-createdAt').limit(5)
    ]);

    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyTrend = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$date' }, 
            month: { $month: '$date' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const topDiagnoses = await Prescription.aggregate([
      {
        $group: {
          _id: '$diagnosis',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Simulated revenue
    const monthlyRevenue = monthlyAppointments * 1500;
    const yearlyRevenue = yearlyAppointments * 1500;

    res.json({
      summary: {
        totalPatients,
        totalDoctors,
        totalReceptionists,
        totalAppointments,
        totalPrescriptions,
        monthlyAppointments,
        monthlyRevenue,
        yearlyRevenue
      },
      charts: {
        appointmentsByStatus,
        monthlyTrend,
        topDiagnoses
      },
      recentData: {
        recentAppointments,
        recentPatients
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor dashboard statistics
// @route   GET /api/analytics/doctor/dashboard
// @access  Private/Doctor
export const getDoctorDashboardStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow }
    }).populate('patient', 'name age');

    const [
      totalPatients,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalPrescriptions,
      monthlyAppointments
    ] = await Promise.all([
      Appointment.distinct('patient', { doctor: doctorId }).then(ids => ids.length),
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
      Appointment.countDocuments({ doctor: doctorId, status: 'pending' }),
      Prescription.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ 
        doctor: doctorId,
        date: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) }
      })
    ]);

    const upcomingAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: now },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('patient', 'name contact')
      .sort('date')
      .limit(5);

    const recentPrescriptions = await Prescription.find({ doctor: doctorId })
      .populate('patient', 'name')
      .sort('-createdAt')
      .limit(5);

    const patients = await Appointment.distinct('patient', { doctor: doctorId });
    const ageGroups = await Patient.aggregate([
      { $match: { _id: { $in: patients } } },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 30, 50, 70, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.json({
      summary: {
        todayAppointments: todayAppointments.length,
        totalPatients,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalPrescriptions,
        monthlyAppointments,
        completionRate: totalAppointments ? 
          ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0
      },
      todaySchedule: todayAppointments,
      upcomingAppointments,
      recentPrescriptions,
      ageGroups
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/analytics/admin/revenue
// @access  Private/Admin
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period } = req.query; // monthly, quarterly, yearly
    
    let startDate;
    const now = new Date();
    
    switch(period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        break;
      case 'quarterly':
        startDate = new Date(now.getFullYear() - 2, 0, 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear() - 4, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    }

    const appointments = await Appointment.find({
      date: { $gte: startDate },
      status: 'completed'
    });

    const avgFee = 1500;
    
    // Group by month
    const monthlyRevenue = {};
    appointments.forEach(apt => {
      const monthYear = apt.date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + avgFee;
    });

    const totalRevenue = appointments.length * avgFee;
    const totalAppointments = appointments.length;
    const avgRevenuePerDay = totalRevenue / 30;

    const revenueByDoctor = await Appointment.aggregate([
      { $match: { status: 'completed', date: { $gte: startDate } } },
      {
        $group: {
          _id: '$doctor',
          count: { $sum: 1 },
          revenue: { $sum: avgFee }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    await User.populate(revenueByDoctor, { path: '_id', select: 'name' });

    res.json({
      summary: {
        totalRevenue,
        totalAppointments,
        avgRevenuePerDay,
        period: period || 'last 6 months'
      },
      monthlyRevenue,
      topDoctors: revenueByDoctor.map(d => ({
        doctor: d._id,
        appointments: d.count,
        revenue: d.revenue
      }))
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient analytics
// @route   GET /api/analytics/admin/patients
// @access  Private/Admin
export const getPatientAnalytics = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();

    const genderDistribution = await Patient.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    const ageDistribution = await Patient.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 30, 50, 70, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    const bloodGroupDistribution = await Patient.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          count: { $sum: 1 }
        }
      }
    ]);

    const newPatientsOverTime = await Patient.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      total: totalPatients,
      genderDistribution,
      ageDistribution,
      bloodGroupDistribution,
      newPatientsOverTime
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointment analytics
// @route   GET /api/analytics/admin/appointments
// @access  Private/Admin
export const getAppointmentAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const appointmentsByDay = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const appointmentsByType = await Appointment.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const averageWaitTime = await Appointment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $exists: true },
          date: { $exists: true }
        }
      },
      {
        $project: {
          waitTime: { 
            $divide: [
              { $subtract: ['$date', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageWaitHours: { $avg: '$waitTime' }
        }
      }
    ]);

    res.json({
      byDayOfWeek: appointmentsByDay,
      byType: appointmentsByType,
      averageWaitHours: averageWaitTime[0]?.averageWaitHours || 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get prescription analytics
// @route   GET /api/analytics/admin/prescriptions
// @access  Private/Admin
export const getPrescriptionAnalytics = async (req, res) => {
  try {
    const totalPrescriptions = await Prescription.countDocuments();

    const prescriptionsOverTime = await Prescription.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const topMedicines = await Prescription.aggregate([
      { $unwind: '$medicines' },
      {
        $group: {
          _id: '$medicines.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      total: totalPrescriptions,
      prescriptionsOverTime,
      topMedicines
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top diagnoses
// @route   GET /api/analytics/admin/top-diagnosis
// @access  Private/Admin
export const getTopDiagnosis = async (req, res) => {
  try {
    const topDiagnoses = await Prescription.aggregate([
      {
        $group: {
          _id: '$diagnosis',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json(topDiagnoses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get doctor performance
// @route   GET /api/analytics/admin/doctor-performance
// @access  Private/Admin
export const getDoctorPerformance = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const performance = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$doctor',
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      { $unwind: '$doctorInfo' },
      {
        $project: {
          doctorName: '$doctorInfo.name',
          specialization: '$doctorInfo.specialization',
          totalAppointments: 1,
          completedAppointments: 1,
          cancelledAppointments: 1,
          completionRate: {
            $multiply: [
              { $divide: ['$completedAppointments', '$totalAppointments'] },
              100
            ]
          }
        }
      },
      { $sort: { completionRate: -1 } }
    ]);

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly report
// @route   GET /api/analytics/admin/monthly-report
// @access  Private/Admin
export const getMonthlyReport = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      monthlyAppointments,
      monthlyPatients,
      monthlyPrescriptions,
      monthlyRevenue
    ] = await Promise.all([
      Appointment.countDocuments({
        date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      }),
      Patient.countDocuments({
        createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      }),
      Prescription.countDocuments({
        createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
      }),
      Appointment.countDocuments({
        date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
        status: 'completed'
      }).then(count => count * 1500)
    ]);

    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const previousMonthAppointments = await Appointment.countDocuments({
      date: { $gte: previousMonthStart, $lte: previousMonthEnd }
    });

    const growth = previousMonthAppointments 
      ? ((monthlyAppointments - previousMonthAppointments) / previousMonthAppointments * 100).toFixed(1)
      : 0;

    res.json({
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      summary: {
        appointments: monthlyAppointments,
        newPatients: monthlyPatients,
        prescriptions: monthlyPrescriptions,
        revenue: monthlyRevenue
      },
      growth: {
        percentage: growth,
        trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily stats for doctor
// @route   GET /api/analytics/doctor/daily-stats
// @access  Private/Doctor
export const getDailyStats = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow }
    }).populate('patient', 'name age');

    const completedToday = appointments.filter(a => a.status === 'completed').length;
    const pendingToday = appointments.filter(a => a.status === 'pending').length;
    const cancelledToday = appointments.filter(a => a.status === 'cancelled').length;

    res.json({
      date: today,
      total: appointments.length,
      completed: completedToday,
      pending: pendingToday,
      cancelled: cancelledToday,
      appointments
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get patient dashboard statistics
// @route   GET /api/analytics/patient/dashboard
// @access  Private/Patient
export const getPatientDashboardStats = async (req, res) => {
  try {
    const patientId = req.user._id;

    const [
      totalAppointments,
      activePrescriptions,
      upcomingAppointments,
      completedVisits,
      recentAppointments,
      recentPrescriptions
    ] = await Promise.all([
      Appointment.countDocuments({ patient: patientId }),
      Prescription.countDocuments({ patient: patientId, status: 'active' }),
      Appointment.countDocuments({ 
        patient: patientId, 
        date: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      }),
      Appointment.countDocuments({ 
        patient: patientId, 
        status: 'completed' 
      }),
      Appointment.find({ patient: patientId })
        .populate('doctor', 'name')
        .sort('-date')
        .limit(5),
      Prescription.find({ patient: patientId })
        .populate('doctor', 'name')
        .sort('-createdAt')
        .limit(5)
    ]);

    res.json({
      summary: {
        totalAppointments,
        activePrescriptions,
        upcomingAppointments,
        completedVisits
      },
      recentAppointments,
      recentPrescriptions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get receptionist dashboard statistics
// @route   GET /api/analytics/receptionist/dashboard
// @access  Private/Receptionist
export const getReceptionistDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      todayAppointments,
      pendingTasks,
      completedToday
    ] = await Promise.all([
      Patient.countDocuments(),
      Appointment.find({
        date: { $gte: today, $lt: tomorrow }
      })
        .populate('patient', 'name')
        .populate('doctor', 'name')
        .sort('date'),
      // Mock pending tasks - in real app this would be a separate collection
      Promise.resolve([
        { title: 'Follow up with patient records', description: 'Update missing contact information', priority: 'high' },
        { title: 'Schedule doctor availability', description: 'Update next week\'s slots', priority: 'medium' }
      ]),
      Appointment.countDocuments({
        date: { $gte: today, $lt: tomorrow },
        status: 'completed'
      })
    ]);

    res.json({
      summary: {
        totalPatients,
        todayAppointments: todayAppointments.length,
        pendingTasks: pendingTasks.length,
        completedToday
      },
      todayAppointments,
      pendingTasks
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};