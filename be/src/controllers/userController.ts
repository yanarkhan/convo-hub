import type { Request, Response, NextFunction } from "express";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "../utils/schema/user";
import fs from "node:fs";
import * as userService from "../services/userService";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate file upload
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Photo is required",
      });
      return;
    }

    // Validate request body with Zod
    const parseResult = signUpSchema.safeParse(req.body);
    if (!parseResult.success) {
      if (req.file?.path) {
        fs.unlinkSync(req.file.path);
      }

      const errorMessages = parseResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
      return;
    }

    // Create user
    const newUser = await userService.signUp(parseResult.data, req.file);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = signInSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map(
        (err) => `${err.path} - ${err.message}`
      );

      res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: errorMessages,
      });
      return;
    }

    const data = await userService.signIn(parseResult.data);
    res.json({
      success: true,
      message: "Sign in success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );

      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
      return;
    }

    await userService.requestPasswordReset(parseResult.data.email);

    res.status(200).json({
      success: true,
      message:
        "If your email is registered, you will receive a password reset link shortly.",
    });
  } catch (error) {
    next(error);
  }
};

export const cleanupExpiredTokens = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deletedCount = await userService.cleanupExpiredResetTokens();

    res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount} expired tokens`,
      data: { deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );

      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errorMessages,
      });
      return;
    }

    const { tokenId } = req.params;
    if (!tokenId) {
      res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
      return;
    }

    await userService.resetPassword(parseResult.data, tokenId);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    next(error);
  }
};
