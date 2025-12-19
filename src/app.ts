import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { globalErrorHandler } from './middlewares/errorHandler';
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
// CORS configuration - allow all origins in production, configure specific origins in .env
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : (process.env.NODE_ENV === 'production' ? true : 'http://localhost:3000'),
  credentials: true
};
app.use(cors(corsOptions));


const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use(mongoSanitize());


if (process.env.NODE_ENV === 'development') {
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
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
}

export default app;
