import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'jharkhand_safety_ar_platform_secure_token_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_TYPE: process.env.DB_TYPE || 'sqlite',
  SQLITE_PATH: process.env.SQLITE_PATH || './data/sih_safety.db',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sih_safety',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  QR_VERIFICATION_BASE_URL: process.env.QR_VERIFICATION_BASE_URL || 'http://localhost:3000/verify',
};
