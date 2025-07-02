import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import barbershopRoutes from './routes/barbershops';
import bookingRoutes from './routes/bookings';
import barberRoutes from './routes/barbers';
import serviceRoutes from './routes/services';
import timeslotRoutes from './routes/timeslots';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigins = config.cors.origin.split(',').map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: config.server.isDevelopment ? 60000 : config.rateLimit.windowMs, // 1 minute in dev, 15 minutes in prod
  max: config.server.isDevelopment ? 1000 : config.rateLimit.maxRequests, // 1000 requests per minute in dev
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser(config.cookie.secret));

// Request logging in development
if (config.server.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/barbershops', barbershopRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/timeslots', timeslotRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.server.nodeEnv}`);
  console.log(`🌐 CORS Origin: ${config.cors.origin}`);
  console.log(`⏰ Rate Limit: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs / 1000 / 60} minutes`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app; 