import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { HttpError } from '../utils/httpError';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    return next(new HttpError(401, 'Authentication token is required'));
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(new HttpError(401, 'Invalid or expired token'));
  }
};

