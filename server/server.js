import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// If DB is not connected, short-circuit API requests with a clear 503
const dbGuard = (req, res, next) => {
  const ready = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  // Allow health checks and root
  if (req.path === '/' || req.path === '/healthz') return next();
  // Allow static uploads regardless
  if (req.path.startsWith('/uploads')) return next();
  if (ready !== 1) {
    return res.status(503).json({ message: 'Database not connected. Please try again shortly.' });
  }
  next();
};
app.use(dbGuard);

app.get('/healthz', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting', 'unauthorized', 'uninitialized'];
  const state = states[mongoose.connection.readyState] || 'unknown';
  res.json({ status: 'ok', db: state });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resume', resumeRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB().catch((err) => {
  console.error(err.message || err);
});
