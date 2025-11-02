import { SignUpResponse, SignUpValues } from "../types/user.types";
import * as userRepositories from "../repositories/userRepositories";
import { hashSync } from "bcrypt";
import jwt from "jsonwebtoken";

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

export const signUp = async (
  data: SignUpValues,
  file: Express.Multer.File
): Promise<SignUpResponse> => {
  const emailExists = await userRepositories.isEmailExist(data.email);
  if (emailExists) {
    throw new EmailAlreadyExistsError(data.email);
  }

  const user = await userRepositories.createUser(
    {
      ...data,
      password: hashSync(data.password, 12),
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
