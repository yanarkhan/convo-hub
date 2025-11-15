import {
  ResetPasswordValues,
  SignInResponse,
  SignInValues,
  SignUpResponse,
  SignUpValues,
} from "../types/user.types";
import * as userRepositories from "../repositories/userRepositories";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import mailtrap from "../utils/mailtrap";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env");
}

export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Email ${email} is already registered`);
    this.name = "EmailAlreadyExistsError";
  }
}

export class InvalidFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFileError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

export class MailServiceError extends Error {
  constructor(message: string) {
    super(`Failed to send email: ${message}`);
    this.name = "MailServiceError";
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super("Invalid or expired reset token");
    this.name = "InvalidTokenError";
  }
}

export const signUp = async (
  data: SignUpValues,
  file: Express.Multer.File
): Promise<SignUpResponse> => {
  const emailExists = await userRepositories.isEmailExist(data.email);
  if (emailExists) {
    throw new EmailAlreadyExistsError(data.email);
  }

  const passwordHash = await hash(data.password, 12);
  const user = await userRepositories.createUser(
    {
      ...data,
      password: passwordHash,
    },
    file.filename
  );

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      photo_url: user.photo_url,
      role: user.role.role,
    },
    token,
  };
};

export const signIn = async (data: SignInValues): Promise<SignInResponse> => {
  const user = await userRepositories.findUserByEmail(data.email);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const isPasswordMatch = await compare(data.password, user.password);
  if (!isPasswordMatch) {
    throw new InvalidCredentialsError();
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      photo_url: user.photo_url,
      role: user.role.role,
    },
    token,
  };
};

export const requestPasswordReset = async (email: string): Promise<boolean> => {
  try {
    const resetData = await userRepositories.createPasswordReset(email);
    if (!resetData) {
      console.log(
        `[SECURITY] Password reset requested for non-existent email: ${email}`
      );
      return true;
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetData.token}`;
    await mailtrap.testing.send({
      from: {
        email: "convohub@test.com",
        name: "ConvoHub",
      },
      to: [{ email }],
      subject: "Reset Your Password - ConvoHub",
      text: `Hi,\n\nYou requested to reset your password. Click the link below to reset:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nConvoHub Team`,
    });

    console.log(`[SUCCESS] Password reset email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to send password reset email:", error);
    throw new MailServiceError(
      "Unable to send reset email. Please try again later."
    );
  }
};

export const cleanupExpiredResetTokens = async (): Promise<number> => {
  const deletedCount = await userRepositories.cleanupExpiredTokens();
  console.log(
    `[CLEANUP] Deleted ${deletedCount} expired password reset tokens`
  );
  return deletedCount;
};

export const resetPassword = async (
  data: ResetPasswordValues,
  token: string
): Promise<boolean> => {
  const tokenData = await userRepositories.findResetDataByToken(token);
  if (!tokenData) {
    throw new InvalidTokenError();
  }

  const passwordHash = await hash(data.password, 12);
  await userRepositories.updateUserPassword(tokenData.users.id, passwordHash);

  await userRepositories.deletePasswordResetById(tokenData.id);

  console.log(`[SUCCESS] Password reset for user: ${tokenData.users.email}`);
  return true;
};
