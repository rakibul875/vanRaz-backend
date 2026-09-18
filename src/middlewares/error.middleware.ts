import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

export interface AppError extends Error {
  statusCode?: number;
}

export const globalErrorHandler = (
  err: AppError | ZodError | Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errors: unknown = null;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
    }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  } else if (
    'code' in err &&
    typeof (err as { code?: unknown }).code === 'number' &&
    (err as { code: number }).code === 11000
  ) {
    statusCode = 409;
    message = 'Duplicate key error. A record with this value already exists.';
  } else if ('statusCode' in err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
  });
};
