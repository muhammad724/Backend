import mongoose from 'mongoose';

const DoctorProfileSchema = new mongoose.Schema({
  // Link to the User ID (where email/password/role='Doctor' are stored)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  specialization: { 
    type: String, 
    required: true,
    default: "General Physician" 
  },
  
  licenseNumber: { 
    type: String, 
    required: true 
  },
  
  experienceYears: { 
    type: Number 
  },
  
  // Doctor Schedule View (For Appointment Management)
  availability: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: String, // e.g., "09:00 AM"
    endTime: String    // e.g., "05:00 PM"
  }],

  // Personal Stats (For Doctor Dashboard)
  bio: { type: String },
  fees: { type: Number, default: 0 },
  
  // Rating/Reviews (Optional but adds "Final Hackathon" polish)
  averageRating: { type: Number, default: 0 }
  
}, { timestamps: true });

export default mongoose.model('DoctorProfile', DoctorProfileSchema);