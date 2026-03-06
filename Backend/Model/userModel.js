import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // never return it by default
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'receptionist', 'patient'],
    default: 'patient'
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  specialization: String,
  contactNumber: String,
  profileImage: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// hash password before saving
// we use an async middleware that returns a promise rather than
// calling `next()`; Mongoose drops the `next` argument for async
// functions, so attempting to invoke it leads to "next is not a
// function" errors. remove the parameter and simply return.
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    // nothing to do; just let the save continue
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// method to compare entered password to hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);