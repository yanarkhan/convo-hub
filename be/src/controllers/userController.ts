import type { Request, Response, NextFunction } from "express";
import { signUpSchema } from "../utils/schema/user";
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
