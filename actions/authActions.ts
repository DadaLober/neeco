"use server"

import { loginSchema, registerSchema } from "@/schemas"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt"
import { z } from "zod"
import { auth } from "@/auth"
import { cookies } from "next/headers"

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

export async function login(values: LoginInput, callbackUrl?: string | null) {
    const result = loginSchema.safeParse(values)

    if (!result.success) {
        return { error: "Invalid input" }
    }

    const redirectUrl = callbackUrl || "/dashboard"

    try {
        const user = await prisma.user.findUnique({
            where: { email: values.email }
        });

        if (!user || !user.isActive) {
            return { error: "Account is not active" };
        }

        // Update last login and reset login attempts
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
            return { error: "Invalid credentials" };
        }

        // If 2FA is enabled for the user
        if (user.is2FAEnabled) {

            (await cookies()).set("2fa_enabled", "true", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
            return {
                success: true,
                requires2FA: true,
                callbackUrl: redirectUrl
            };
        }

        return {
            success: true,
            requires2FA: false,
            url: redirectUrl
        };

    } catch (error) {
        if (error instanceof AuthError) {
            // Increment login attempts on failure
            await prisma.user.update({
                where: { email: values.email },
                data: {
                    loginAttempts: { increment: 1 }
                }
            });

            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" }
                default:
                    return { error: "Something went wrong" }
            }
        }
        throw error
    }
}

// New function to handle 2FA completion
export async function complete2FALogin(callbackUrl?: string) {
    const session = await auth();

    if (!session?.user) {
        return { error: "Authentication required" };
    }
    9
    await (await cookies()).delete("2fa_enabled");

    const redirectUrl = callbackUrl || "/dashboard";
    return { success: true, url: redirectUrl };
}

export async function register(values: RegisterInput) {
    const result = registerSchema.safeParse(values)

    if (!result.success) {
        return { error: "Invalid input" }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: values.email },
        })

        if (existingUser) {
            return { error: "Email already in use" }
        }

        const hashedPassword = await hash(values.password, 10)

        await prisma.user.create({
            data: {
                name: values.name,
                email: values.email,
                password: hashedPassword,
            },
        })
        redirect("/login")
    } catch (error) {
        return { error: "Something went wrong" }
    }
}