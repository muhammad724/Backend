import Notification from '../Model/notificationModel.js';
import User from '../Model/userModel.js';
import Patient from '../Model/patientModel.js';

// @desc    Get my notifications
// @route   GET /api/notifications/my-notifications
// @access  Private
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user._id 
    })
      .sort('-createdAt')
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      status: 'pending'
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.status = 'read';
    notification.readAt = Date.now();
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        recipient: req.user._id,
        status: 'pending'
      },
      { 
        status: 'read',
        readAt: Date.now()
      }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.deleteOne();
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send notification (Admin only)
// @route   POST /api/notifications/send
// @access  Private/Admin
export const sendNotification = async (req, res) => {
  try {
    const { recipientId, type, title, message, data } = req.body;

    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
      status: 'pending'
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send appointment reminder
// @route   POST /api/notifications/appointment-reminder
// @access  Private
export const sendAppointmentReminder = async (req, res) => {
  try {
    const { appointmentId, patientId, doctorName, date, time } = req.body;

    // Get patient to get user ID
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find user by email
    const user = await User.findOne({ email: patient.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const notification = await Notification.create({
      recipient: user._id,
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `You have an appointment with Dr. ${doctorName} on ${new Date(date).toLocaleDateString()} at ${time}`,
      data: { appointmentId },
      status: 'pending'
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};