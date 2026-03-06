import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

// Import routes
import authRoutes from './Route/AuthRoutes.js';
import userRoutes from './Route/userRoute.js';
import patientRoutes from './Route/PatientRoute.js';
import appointmentRoutes from './Route/AppointmentRoute.js';
import prescriptionRoutes from './Route/preceptionRoute.js';
// import aiRoutes from './Route/aiRoutes.js';
import analyticsRoutes from './Route/AnalyticsRoutes.js';
import adminRoutes from './Route/AdminRoutes.js';
import doctorRoutes from './Route/DoctorRoute.js';
import receptionistRoutes from './Route/receptionistModel.js';
import notificationRoutes from './Route/NotificationRoute.js';
import subscriptionRoutes from './Route/subscriptionRoute.js';
import uploadRoutes from './Route/UploadRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ------------------------
// MongoDB connection
// ------------------------
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env file");
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("📊 Database:", mongoose.connection.name);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  });

// ------------------------
// Routes
// ------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
// app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/upload', uploadRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Clinic Management API',
    status: 'running',
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    time: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: err.message 
  });
});

// export app for serverless environments (e.g. Vercel) or testing
export default app;

// listen when running locally (node index.js or start script)
if (process.env.RUN_LOCAL === 'true' || process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}