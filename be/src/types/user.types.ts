import { z } from "zod";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "../utils/schema/user";

export type SignUpValues = z.infer<typeof signUpSchema>;
export type SignInValues = z.infer<typeof signInSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export interface SignUpResponse {
  user: {
    id: string;
    name: string;
    email: string;
    photo_url: string | null;
    role: string;
  };
  token: string;
}

export interface SignInResponse {
  user: {
    id: string;
    name: string;
    email: string;
    photo_url: string | null;
    role: string;
  };
  token: string;
}
