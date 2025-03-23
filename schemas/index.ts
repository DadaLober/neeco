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

// export const ItemTypeSchema = z.enum(['APV', 'BOM', 'BR', 'CA', 'COC', 'CV', 'ICT', 'IS', 'KMCT', 'MC', 'MRV', 'PM',
//     'PO', 'RET', 'RM', 'RR', 'RS', 'RV', 'SA', 'SOP', 'ST', 'TMZ', 'TO', 'TOA']);
// export const ItemStatusSchema = z.enum(['APP', 'AUD', 'CHK', 'CON', 'FPO', 'NOC', 'NOT', 'PRV', 'RCV', 'REC', 'REQ', 'VER']);
// export const UserStatusSchema = z.boolean();