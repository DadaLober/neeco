"use server"

import { loginSchema, registerSchema, callbackUrlSchema } from "@/schemas";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { z } from "zod";
import { cookies } from "next/headers";
import { AuthError } from "next-auth";
import { requireAuth } from "./roleActions";

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export async function login(values: LoginInput, callbackUrl?: string | null) {
    const result = loginSchema.safeParse(values);
    const parsedCallbackUrl = callbackUrlSchema.safeParse(callbackUrl);

    if (!result.success) {
        return { error: "Invalid input" };
    }

    const redirectUrl = parsedCallbackUrl.success ? parsedCallbackUrl.data : "/dashboard";

    try {
        const user = await prisma.user.findUnique({
            where: { email: values.email }
        });

        if (!user || !user.isActive) {
            return { error: "Account is not active" };
        }

        await prisma.user.update({
            where: { email: values.email },
            data: {
                lastLogin: new Date(),
                loginAttempts: 0
            }
        });

        const signInResult = await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false
        });

        if (signInResult?.error) {
            return { error: "Invalid email or password" };
        }

        if (user.is2FAEnabled) {
            try {
                (await cookies()).set("2fa_enabled", "true", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    path: "/",
                    maxAge: 60 * 15 // 15 minutes
                });
                return {
                    success: true,
                    requires2FA: true,
                    callbackUrl: redirectUrl
                };
            } catch (error) {
                console.error("Error setting 2FA cookie:", error);
                return { error: "Something went wrong" };
            }
        }

        return {
            success: true,
            requires2FA: false,
            url: redirectUrl
        };
    } catch (error) {
        if (error instanceof AuthError) {
            await prisma.user.update({
                where: { email: values.email },
                data: {
                    loginAttempts: { increment: 1 }
                }
            });

            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid email or password" };
                default:
                    return { error: "Something went wrong" };
            }
        }
        throw error;
    }
}

export async function complete2FALogin(callbackUrl?: string) {
    await requireAuth();
    const parsedCallbackUrl = callbackUrlSchema.safeParse(callbackUrl);
    try {
        await (await cookies()).delete("2fa_enabled");
    } catch (error) {
        console.error("Error deleting 2FA cookie:", error);
        return { error: "Something went wrong" };
    }
    const redirectUrl = parsedCallbackUrl.success ? parsedCallbackUrl.data : "/dashboard";
    return { success: true, url: redirectUrl };
}

export async function register(values: RegisterInput, callbackUrl?: string | null) {
    const result = registerSchema.safeParse(values);
    const parsedCallbackUrl = callbackUrlSchema.safeParse(callbackUrl);

    if (!result.success) {
        return { error: "Invalid input" };
    }

    const redirectUrl = parsedCallbackUrl.success ? parsedCallbackUrl.data : "/login";

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: values.email },
        });

        if (existingUser) {
            return { error: "Email already in use" };
        }

        const hashedPassword = await hash(values.password, 10);

        await prisma.user.create({
            data: {
                name: values.name,
                email: values.email,
                password: hashedPassword,
            },
        });
        return { success: true, message: "Registration successful", url: redirectUrl };
    } catch (error) {
        return { error: "Something went wrong" };
    }
}
