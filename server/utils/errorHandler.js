class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Mark as operational error (vs. programming error)

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Not authorized") {
    super(message, 401);
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new BadRequestError(message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new BadRequestError(message);
};

const sendErrorDev = (err, res) => {
  console.error("ERROR 💥", err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("ERROR 💥", err);
    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  error.message = err.message; // Need to copy message explicitly as it's not enumerable

  // Specific error handling for Mongoose errors, etc.
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  // Add more specific handlers here (e.g., JWT errors, duplicate key errors)

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else {
    // In production, use the modified error object if it's an AppError, otherwise use the original err
    sendErrorProd(error.isOperational ? error : err, res);
  }
};

module.exports = {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  globalErrorHandler,
};
