import { z } from "zod";

export const signInSchema = z.object({
  email: z.email({ error: "Enter a valid work email address." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Enter your password." }).max(128, { error: "Password is too long." }),
});

export const signUpSchema = z.object({
  firstName: z.string().trim().min(2, { error: "First name must have at least 2 characters." }).max(80),
  lastName: z.string().trim().min(2, { error: "Last name must have at least 2 characters." }).max(80),
  email: z.email({ error: "Enter a valid work email address." }).trim().toLowerCase(),
  password: z.string()
    .min(12, { error: "Use at least 12 characters." })
    .max(128, { error: "Password must be 128 characters or fewer." })
    .regex(/[a-z]/, { error: "Add at least one lowercase letter." })
    .regex(/[A-Z]/, { error: "Add at least one uppercase letter." })
    .regex(/[0-9]/, { error: "Add at least one number." }),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
