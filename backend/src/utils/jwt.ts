import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET || 'default-access-secret',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET || 'default-access-secret'
  ) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'
  ) as TokenPayload;
};
