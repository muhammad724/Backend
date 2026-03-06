import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './Model/userModel.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      console.error("❌ MONGODB_URI is not defined in .env file");
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@clinic.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      console.log('🔑 Password: admin123');
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@clinic.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@clinic.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();