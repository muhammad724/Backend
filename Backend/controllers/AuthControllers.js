import jwt from 'jsonwebtoken';
import User from '../Model/userModel.js';
import Patient from '../Model/patientModel.js';
import Doctor from '../Model/DoctorModel.js';
import Receptionist from '../Model/receptionistModel.js';

// Generate JWT Token
// now includes user's role so middleware can authorize correctly
const generateToken = (user) => {
  const payload = { id: user._id };
  if (user.role) payload.role = user.role;
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, contactNumber, role = 'patient' } = req.body;

    // validate password length (minimum 8, maximum 15)
    if (!password || password.length < 8 || password.length > 15) {
      return res.status(400).json({
        message: 'Password must be between 8 and 15 characters'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    const validRoles = ['patient', 'doctor', 'receptionist'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      contactNumber
    });

    // Create role-specific profile
    try {
      if (role === 'patient') {
        await Patient.create({
          name,
          email,
          createdBy: user._id
        });
      } else if (role === 'doctor') {
        await Doctor.create({
          userId: user._id,
          specialization: 'General Physician', // default
          licenseNumber: `TEMP-${Date.now()}`, // temporary license
        });
      } else if (role === 'receptionist') {
        await Receptionist.create({
          user: user._id,
          shiftStart: '09:00',
          shiftEnd: '17:00'
        });
      }
    } catch (profileError) {
      // If profile creation fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ 
        message: 'Failed to create user profile. Please try again.' 
      });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`[AUTH] login failed - user not found for email=${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      console.log(`[AUTH] login failed - password mismatch for userId=${user._id}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Contact admin.' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan,
      specialization: user.specialization,
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // new password length enforcement
    if (!newPassword || newPassword.length < 8 || newPassword.length > 15) {
      return res.status(400).json({
        message: 'Password must be between 8 and 15 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};