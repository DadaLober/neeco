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
        await signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" }
                default:
                    return { error: "Something went wrong" }
            }
        }
        throw error
    }

    redirect("/")
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

    redirect("/")
}
