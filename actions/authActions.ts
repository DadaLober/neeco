"use server"

import { hash } from "bcrypt";
import { z } from "zod";
import { cookies } from "next/headers";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { loginSchema, registerSchema } from "@/schemas";
import { UnauthorizedResponse } from "@/schemas/types";
import { createUserInDB, getUserByEmailFromDB, setLastLoginInDB, setLoginAttemptsInDB } from "./databaseActions";
import { isUserOrAdmin } from "./roleActions";

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export async function login(values: LoginInput):
    Promise<{ success: true, requires2FA: boolean, callbackUrl: string } | UnauthorizedResponse> {
    const result = loginSchema.safeParse(values);

    if (!result.success) {
        return { error: "Invalid input" };
    }

    const redirectUrl = "/dashboard";

    try {
        const user = await getUserByEmailFromDB(values.email)

        if (!user) {
            return { error: "Invalid email or password" };
        }

        setLastLoginInDB(values.email)

        await signIn("credentials", {
            email: values.email, password: values.password, redirect: false
        });

        if (user.is2FAEnabled) {
            try {
                (await cookies()).set("2fa_enabled", "true", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    path: "/",
                    maxAge: 60 * 15 // 15 minutes,
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
            callbackUrl: redirectUrl
        };
    } catch (error) {
        if (error instanceof AuthError) {
            await setLoginAttemptsInDB(values.email);

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

export async function complete2FALogin(): Promise<{ callbackUrl: string } | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" }
    }

    const redirectUrl = "/dashboard";

    try {
        await (await cookies()).delete("2fa_enabled");
    } catch (error) {
        console.error("Error deleting 2FA cookie:", error);
        return { error: "Something went wrong" };
    }

    return { callbackUrl: redirectUrl };
}

export async function register(values: RegisterInput): Promise<{ callbackUrl: string } | UnauthorizedResponse> {
    const result = registerSchema.safeParse(values);

    if (!result.success) {
        return { error: "Invalid input" };
    }

    const redirectUrl = "/login";
    const defaultRole = "USER";

    try {
        const existingUser = await getUserByEmailFromDB(values.email);

        if (existingUser) {
            return { error: "Email already in use" };
        }

        const hashedPassword = await hash(values.password, 10);

        await createUserInDB(values.name, values.email, defaultRole, hashedPassword);

        return { callbackUrl: redirectUrl };
    } catch (error) {
        return { error: "Something went wrong" };
    }
}
