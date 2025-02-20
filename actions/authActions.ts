"use server"

import { loginSchema, registerSchema } from "@/schemas"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt"
import { z } from "zod"

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

export async function login(values: LoginInput) {
    const result = loginSchema.safeParse(values)

    if (!result.success) {
        return { error: "Invalid input" }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: values.email }
        });

        if (!user || !user.isActive) {
            return { error: "Account is not active" };
        }

        await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
        })

        // Update last login and reset login attempts
        await prisma.user.update({
            where: { email: values.email },
            data: {
                lastLogin: new Date(),
                loginAttempts: 0
            }
        });
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

    redirect("/dashboard")
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

        await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
        })
    } catch (error) {
        return { error: "Something went wrong" }
    }

    redirect("/login")
}
