import { z } from "zod"

export const callbackUrlSchema = z.string().url().optional();

export const IdSchema = z.string().uuid();
export const UserRoleSchema = z.enum(['ADMIN', 'USER', 'MODERATOR']);
export const otpSchema = z.string().length(6).regex(/^[0-9]+$/);
export const UserStatusSchema = z.boolean();

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})
