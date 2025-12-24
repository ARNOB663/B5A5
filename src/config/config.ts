import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// CRITICAL FIX: Read environment variables in standard uppercase format only
// Vercel sets env vars in uppercase (MONGODB_URI, not mongodb_uri)
const env = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && !fallback) {
    console.warn(`⚠️ Environment variable ${key} is not set and has no fallback`);
  }
  return value ?? fallback ?? '';
};

// Validate critical environment variables
const mongodbUri = env('MONGODB_URI', 'mongodb://localhost:27017/ride-booking');
const jwtSecret = env('JWT_SECRET', 'fallback-secret-CHANGE-IN-PRODUCTION');

// Log validation results (without exposing secrets)
console.log('🔐 Environment Variables Status:');
console.log('  MONGODB_URI:', mongodbUri.includes('mongodb') ? '✅ SET' : '❌ NOT SET');
console.log('  JWT_SECRET:', jwtSecret !== 'fallback-secret-CHANGE-IN-PRODUCTION' ? '✅ SET' : '⚠️ USING FALLBACK');
console.log('  NODE_ENV:', env('NODE_ENV', 'development'));

export const config = {
  port: parseInt(env('PORT', '3000')),
  nodeEnv: env('NODE_ENV', 'development'),
  vercel: env('VERCEL'),
  mongodbUri,
  jwtSecret,
  jwtExpiresIn: env('JWT_EXPIRES_IN', '7d'),
  bcryptSaltRounds: parseInt(env('BCRYPT_SALT_ROUNDS', '12')),
  rateLimitWindowMs: parseInt(env('RATE_LIMIT_WINDOW_MS', '900000')),
  rateLimitMaxRequests: parseInt(env('RATE_LIMIT_MAX_REQUESTS', '100')),
  corsOrigin: env('CORS_ORIGIN', '*')
};
