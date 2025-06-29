import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserPayload } from '../types';

export const generateAccessToken = (payload: UserPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

export const generateRefreshToken = (payload: UserPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): UserPayload => {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as UserPayload;
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): UserPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as UserPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

export const decodeToken = (token: string): UserPayload | null => {
  try {
    return jwt.decode(token) as UserPayload;
  } catch (error) {
    return null;
  }
}; 