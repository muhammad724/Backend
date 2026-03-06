import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  contact: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    sparse: true
  },
  address: String,
  bloodGroup: String,
  emergencyContact: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String
  }],
  allergies: [String]
}, {
  timestamps: true
});

export default mongoose.model('Patient', patientSchema);