import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export type JwtPayload = {
  userId: string;
  email: string;
};

const signToken = (payload: JwtPayload, secret: Secret, expiresIn: SignOptions['expiresIn']) =>
  jwt.sign(payload, secret, { expiresIn });

export const createAccessToken = (payload: JwtPayload) =>
  signToken(payload, env.jwtAccessSecret, env.jwtAccessExpiresIn as SignOptions['expiresIn']);

export const createRefreshToken = (payload: JwtPayload) =>
  signToken(payload, env.jwtRefreshSecret, env.jwtRefreshExpiresIn as SignOptions['expiresIn']);

export const verifyAccessToken = (token: string) => jwt.verify(token, env.jwtAccessSecret) as JwtPayload;

export const verifyRefreshToken = (token: string) => jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;

