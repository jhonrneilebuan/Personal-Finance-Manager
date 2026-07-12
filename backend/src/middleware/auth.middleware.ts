import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { verifyAccessToken } from '../utils/jwt';
import { HttpError } from '../utils/httpError';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    return next(new HttpError(401, 'Authentication token is required'));
  }

  let payload: ReturnType<typeof verifyAccessToken>;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(new HttpError(401, 'Invalid or expired token'));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    });

    if (!user) {
      return next(new HttpError(401, 'Session expired. Please log in again.'));
    }

    req.user = payload;
    return next();
  } catch (error) {
    return next(error);
  }
};
