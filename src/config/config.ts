import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper: read lowercase env names first, then fallback to uppercase for compatibility
const env = (key: string, fallback?: string): string | undefined => {
  return process.env[key.toLowerCase()] ?? process.env[key] ?? fallback;
};

// Debug: show whether MongoDB URI is set (do not print the secret)
console.log('🔐 MONGODB_URI (env):', env('MONGODB_URI') ? '[SET]' : '[NOT SET]');

export const config = {
  port: env('PORT', '3000'),
  nodeEnv: env('NODE_ENV', 'development'),
  vercel: env('VERCEL'),
  mongodbUri: env('MONGODB_URI', 'mongodb://localhost:27017/ride-booking'),
  jwtSecret: env('JWT_SECRET', 'fallback-secret'),
  jwtExpiresIn: env('JWT_EXPIRES_IN', '7d'),
  bcryptSaltRounds: parseInt(env('BCRYPT_SALT_ROUNDS', '12') as string),
  rateLimitWindowMs: parseInt(env('RATE_LIMIT_WINDOW_MS', '900000') as string),
  rateLimitMaxRequests: parseInt(env('RATE_LIMIT_MAX_REQUESTS', '100') as string),
  // If unspecified, allow all origins by default (app.ts handles default permissive behaviour)
  corsOrigin: env('CORS_ORIGIN')
};
