import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config } from './config';
import connectDatabase from './config/database';
import { errorHandler, notFoundHandler } from './middlewares/error';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import driverRoutes from './modules/driver/driver.routes';
import rideRoutes from './modules/ride/ride.routes';
import adminRoutes from './modules/admin/admin.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async connectToDatabase(): Promise<void> {
    await connectDatabase();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString(),
      },
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    // Logging
    if (config.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Ride Booking API is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/drivers', driverRoutes);
    this.app.use('/api/rides', rideRoutes);
    this.app.use('/api/admin', adminRoutes);

    // Welcome route
    this.app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Welcome to Ride Booking API',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          drivers: '/api/drivers',
          rides: '/api/rides',
          admin: '/api/admin',
          health: '/health',
        },
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`🌟 Environment: ${config.nodeEnv}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`📘 API Base URL: http://localhost:${config.port}/api`);
    });
  }
}

export default App;
