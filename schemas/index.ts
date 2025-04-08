import { z } from "zod"

export type UnauthorizedResponse = { error: string }

export function validateRole(role: string): string | null {
    const parsedRole = UserRoleSchema.safeParse(role);
    return parsedRole.success ? parsedRole.data : null;
}

export const UserRoleSchema = z.enum(['USER', 'ADMIN']);
export const IdSchema = z.string().cuid()
export const otpSchema = z.string().length(6).regex(/^[0-9]+$/);
export const numberSchema = z.number().min(1);
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
        .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})