import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import registrationRoutes from './routes/registrations.js';
import authRoutes from './routes/auth.js';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production.');
}
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'India Sports Hub API' }));
app.use('/api/registrations', registrationRoutes);
app.use('/api/auth', authRoutes);
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ message: 'Unexpected server error.' });
});

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/india_sports_hub');
  console.log('Connected to MongoDB');
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({ name: process.env.ADMIN_NAME || 'SportsBharat Admin', email: adminEmail, passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'admin' });
      console.log('Initial admin account created from environment configuration.');
    } else if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Configured admin account role updated.');
    }
  }
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
} catch (error) {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
}
