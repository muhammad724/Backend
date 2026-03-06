import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  address: String,

  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubscriptionPlan"
  },

  subscriptionStart: Date,
  subscriptionEnd: Date,
  isSubscriptionActive: { type: Boolean, default: true }

}, { timestamps: true });

export default mongoose.model("Organization", organizationSchema);