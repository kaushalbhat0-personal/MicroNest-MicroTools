import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;
