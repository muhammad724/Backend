import mongoose from 'mongoose';

const diagnosisLogSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  symptoms: [String],
  patientInfo: {
    age: Number,
    gender: String
  },
  medicalHistory: String,
  aiResponse: {
    possibleConditions: [{
      condition: String,
      riskLevel: String,
      suggestedTests: [String]
    }],
    urgencyLevel: String
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  aiModelUsed: {
    type: String,
    enum: ['gemini', 'fallback']
  }
}, {
  timestamps: true
});

export default mongoose.model('DiagnosisLog', diagnosisLogSchema);