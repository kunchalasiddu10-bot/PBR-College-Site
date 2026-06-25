import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface IAccessPayload {
  id: string;
  email: string;
  role: 'Student' | 'Faculty' | 'HOD' | 'Admin' | 'Visitor';
}

export interface IRefreshPayload {
  id: string;
}

/**
 * Generate a JWT Access Token
 */
export const generateAccessToken = (payload: IAccessPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
  });
};

/**
 * Generate a JWT Refresh Token
 */
export const generateRefreshToken = (payload: IRefreshPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as any,
  });
};


/**
 * Verify a JWT Access Token
 */
export const verifyAccessToken = (token: string): IAccessPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as IAccessPayload;
};

/**
 * Verify a JWT Refresh Token
 */
export const verifyRefreshToken = (token: string): IRefreshPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as IRefreshPayload;
};
