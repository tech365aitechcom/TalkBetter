import { Request, Response, NextFunction } from "express";
import ErrorHandler from "@shared/utils/ErrorHandle";
import { CustomError } from "@shared/interfaces/middlewareInterface";


/**
 * Express error-handling middleware to manage different types of errors.
 * It standardizes error responses and handles specific error cases such as:
 * - Invalid MongoDB ID (CastError)
 * - Duplicate key errors (MongoDB)
 * - Invalid or expired JWT tokens
 * 
 * @param err - The error object, expected to be of type `CustomError`
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The next middleware function in the request-response cycle
 * @returns Sends a JSON response with the error message and status code
*/

const ErrorMiddleware = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Handle CastError (Invalid MongoDB ID)
  if (err.name === "CastError" && err.path) {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Handle Duplicate Key Error (MongoDB)
  if (err.code === 11000 && err.keyValue) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // Handle Invalid JWT
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again`;
    err = new ErrorHandler(message, 400);
  }

  // Handle Expired JWT
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, Try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode || 501).json({
    success: false,
    message: err.message,
  });
};


export default ErrorMiddleware;