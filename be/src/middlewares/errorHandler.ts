import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client";
import {
  EmailAlreadyExistsError,
  InvalidFileError,
} from "../services/userService";

interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  stack?: string;
}

export default function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[ERROR]", {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Custom application errors
  if (error instanceof EmailAlreadyExistsError) {
    res.status(409).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof InvalidFileError) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "A record with this information already exists",
      });
      return;
    }

    // Record not found
    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Record not found",
      });
      return;
    }

    // Generic Prisma error
    res.status(500).json({
      success: false,
      message: "Database error occurred",
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      success: false,
      message: "Invalid data provided",
    });
    return;
  }

  // Multer errors
  if (error.name === "MulterError") {
    if (error.message.includes("File too large")) {
      res.status(413).json({
        success: false,
        message: "File size exceeds maximum limit of 5MB",
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  if (error.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
    });
    return;
  }

  // Default error response
  const errorResponse: ErrorResponse = {
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "An error occurred on the server"
        : error.message,
  };

  if (process.env.NODE_ENV === "development" && error.stack) {
    errorResponse.stack = error.stack;
  }

  res.status(500).json(errorResponse);
}
