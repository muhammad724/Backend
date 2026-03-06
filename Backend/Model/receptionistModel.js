import mongoose from 'mongoose';

const receptionistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  shiftStart: String,
  shiftEnd: String
}, { timestamps: true });

export default mongoose.model("Receptionist", receptionistSchema);