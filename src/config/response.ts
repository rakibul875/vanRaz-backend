import { Response } from "express";

// Success Response Types
export interface TSuccessResponse<T> {
  statusCode: number;
  success?: boolean;
  message: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
  };
  data?: T;
}

// Error Issue Details Type
export interface TErrorDetail {
  path: string | number;
  message: string;
}

// Error Response Types
export interface TErrorResponse {
  statusCode: number;
  success: boolean;
  message: string;
  errorDetails?: TErrorDetail[] | unknown;
  stack?: string;
}

/**
 * Send a standardized success response
 */
export const sendSuccessResponse = <T>(
  res: Response,
  data: TSuccessResponse<T>,
): void => {
  res.status(data.statusCode).json({
    success: true,
    statusCode: data.statusCode,
    message: data.message,
    meta: data.meta,
    data: data.data ?? null,
  });
};

/**
 * Send a standardized error response
 */
export const sendErrorResponse = (
  res: Response,
  data: TErrorResponse,
): void => {
  res.status(data.statusCode).json({
    success: false,
    statusCode: data.statusCode,
    message: data.message,
    errorDetails: data.errorDetails ?? null,
    stack: process.env.NODE_ENV === "development" ? data.stack : undefined,
  });
};
