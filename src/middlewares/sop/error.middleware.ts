import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "../../utils/AppError";

const sendErrorDev = (err: AppError | any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError | any, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥:", err);

    res.status(500).json({
      status: "error",
      message: "Something went wrong on the server!",
    });
  }
};

export const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") {
      error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }
    if (err.code === 11000) {
      error = new AppError("Duplicate field value entered", 400);
    }
    if (err.name === "ValidationError") {
      error = new AppError(err.message, 400);
    }

    sendErrorProd(error, res);
  }
};
