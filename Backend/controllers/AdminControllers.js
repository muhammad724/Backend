import User from '../Model/userModel.js';
import Appointment from '../Model/AppointmentModel.js';

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    res.json({
      success: true,
      statistics: {
        totalUsers,
        totalAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch admin statistics',
      error: error.message 
    });
  }
};

// @desc    Toggle subscription
// @route   PATCH /api/admin/upgrade-subscription/:id
// @access  Private/Admin
export const toggleSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { subscriptionPlan: plan },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to update subscription',
      error: error.message 
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};
