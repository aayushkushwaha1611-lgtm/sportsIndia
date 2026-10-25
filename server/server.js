
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import registrationRoutes from './routes/registrations.js';
import authRoutes from './routes/auth.js';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

import dns from 'node:dns';

// DNS configuration for MongoDB SRV lookup
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

const PORT = process.env.PORT || 5000;

// Validate production configuration
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured in production.');
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  })
);

app.use(express.json({ limit: '20kb' }));

// Root route
app.get('/', (_req, res) => {
  res.status(200).send('India Sports Hub API is running!');
});

// Health check route
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'India Sports Hub API',
  });
});

// API routes
app.use('/api/registrations', registrationRoutes);
app.use('/api/auth', authRoutes);

// Handle unknown routes
app.use((_req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Server error:', err.message);

  res.status(500).json({
    message: 'Unexpected server error.',
  });
});

// Start server after successful MongoDB connection
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured.');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connected to MongoDB');

    // Create the initial admin account if configured
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();

      const existingAdmin = await User.findOne({
        email: adminEmail,
      });

      if (!existingAdmin) {
        await User.create({
          name: process.env.ADMIN_NAME || 'SportsBharat Admin',
          email: adminEmail,
          passwordHash: await bcrypt.hash(
            process.env.ADMIN_PASSWORD,
            12
          ),
          role: 'admin',
        });

        console.log('Initial admin account created.');
      } else if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();

        console.log('Configured admin account role updated.');
      }
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
