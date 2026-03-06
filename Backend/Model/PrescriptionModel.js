import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  diagnosis: {
    type: String,
    required: true
  },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  tests: [{
    name: String,
    instructions: String
  }],
  notes: String,
  followUpDate: Date,
  aiExplanation: String,
  aiRiskLevel: {
    type: String,
    enum: ['low', 'medium', 'high']
  }
}, {
  timestamps: true
});

export default mongoose.model('Prescription', prescriptionSchema);