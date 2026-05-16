import jwt from 'jsonwebtoken';

const placeholder = (s) => !s || String(s).includes('your_jwt');

function accessSecret() {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!placeholder(s)) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Set JWT_ACCESS_SECRET in server/.env');
  }
  console.warn('[auth] JWT_ACCESS_SECRET missing or placeholder — using dev-only secret');
  return 'kindred-dev-access-secret-do-not-use-in-production';
}

function refreshSecret() {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!placeholder(s)) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Set JWT_REFRESH_SECRET in server/.env');
  }
  console.warn('[auth] JWT_REFRESH_SECRET missing or placeholder — using dev-only secret');
  return 'kindred-dev-refresh-secret-do-not-use-in-production';
}

export const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, accessSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

export const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, refreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

export const verifyAccessToken = (token) => jwt.verify(token, accessSecret());

export const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret());

/** Call after dotenv; throws in production if secrets are missing. */
export function assertAuthConfig() {
  accessSecret();
  refreshSecret();
}
