import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { globalErrorHandler } from './middlewares/errorHandler';
import { config } from './config/config';
import authRoutes from './modules/auth/authRoutes';
import driverRoutes from './modules/driver/driverRoutes';
import rideRoutes from './modules/ride/rideRoutes';
import adminRoutes from './modules/admin/adminRoutes';


dotenv.config();

const app = express();

// Connect to database (async, but don't block serverless startup)
connectDatabase().catch((error) => {
  console.error('Failed to connect to database:', error);
});

app.use(helmet());
// CORS configuration - allow all origins by default; set `CORS_ORIGIN` to a comma-separated list to restrict
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true
};
app.use(cors(corsOptions));

// Reject requests early if DB is not connected (returns 503 until DB is available)
import { ensureDbConnected } from './middlewares/db';
app.use(ensureDbConnected);

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use(mongoSanitize());


if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}


// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to our Ride Sharing App! 🚗',
    description: 'A secure, scalable, and role-based backend API for ride booking',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      rides: '/api/v1/rides',
      drivers: '/api/v1/drivers',
      admin: '/api/v1/admin'
    },
    documentation: 'See README.md for complete API documentation',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ride Booking API is running!',
    dbConnected: (require('mongoose').connection.readyState === 1),
    timestamp: new Date().toISOString()
  });
});


app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/admin', adminRoutes);


app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(globalErrorHandler);

// Only start server if not in Vercel environment
if (config.vercel !== '1') {
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (config.nodeEnv) {
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    }
  });
} 

export default app;
