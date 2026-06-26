import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { HttpError } from '../utils/httpError';

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError(422, 'Validation failed', errors.array()));
  }
  return next();
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const details = error instanceof HttpError ? error.details : undefined;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    details,
  });
};

