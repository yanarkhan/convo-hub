import { z } from "zod";
import { signUpSchema } from "../utils/schema/user";

export type SignUpValues = z.infer<typeof signUpSchema>;

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
