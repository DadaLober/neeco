"use server"

import { hash } from "bcrypt";
import { AuthError } from "next-auth";
import { cookies } from "next/headers";
import { signIn } from "@/auth";
import { ActionResult, loginSchema, registerSchema } from "@/schemas";
import { createUserInQuery, getUserByEmailQuery, setLastLoginQuery, setLoginAttemptsQuery } from "./queries";
import { checkUserAccess, isUserOrAdmin } from "./roleActions";

export type LoginInput = typeof loginSchema._type;
export type RegisterInput = typeof registerSchema._type;

type LoginResult = {
    requires2FA: boolean;
    callbackUrl: string;
};

const DASHBOARD_URL = "/dashboard";
const LOGIN_URL = "/login";

/**
 * Authenticates a user and handles 2FA if enabled
 */
export async function login(values: LoginInput): Promise<ActionResult<LoginResult>> {
    const validatedInput = loginSchema.safeParse(values);

    if (!validatedInput.success) {
        return {
            success: false,
            error: {
                code: "INVALID_INPUT",
                message: "Please provide valid credentials"
            }
        };
    }

    try {
        const { email, password } = validatedInput.data;
        const user = await getUserByEmailQuery(email);

        if (!user) {
            return {
                success: false,
                error: {
                    code: "AUTHENTICATION_ERROR",
                    message: "Invalid email or password"
                }
            };
        }

        try {
            await signIn("credentials", { email, password, redirect: false });
            await setLastLoginQuery(email);
        } catch (error) {
            if (error instanceof AuthError) {
                await setLoginAttemptsQuery(email);

                return {
                    success: false,
                    error: {
                        code: "AUTHENTICATION_ERROR",
                        message: error.type === "CredentialsSignin"
                            ? "Invalid email or password"
                            : "Authentication failed"
                    }
                };
            }
            throw error;
        }

        if (user.is2FAEnabled) {
            return await setup2FASession(DASHBOARD_URL);
        }

        return {
            success: true,
            data: {
                requires2FA: false,
                callbackUrl: DASHBOARD_URL
            }
        };
    } catch (error) {
        return {
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Failed to process login"
            }
        };
    }
}

/**
 * Completes the 2FA authentication flow
 */
export async function complete2FALogin(): Promise<ActionResult<{ callbackUrl: string }>> {
    const result = await checkUserAccess();
    if (!result.success) {
        return { success: false, error: result.error };
    }

    try {
        await (await cookies()).delete("2fa_enabled");

        return {
            success: true,
            data: { callbackUrl: DASHBOARD_URL }
        };
    } catch (error) {
        return {
            success: false,
            error: {
                code: "COOKIE_ERROR",
                message: "Failed to complete authentication"
            }
        };
    }
}

/**
 * Registers a new user
 */
export async function register(values: RegisterInput): Promise<ActionResult<{ callbackUrl: string }>> {
    const validatedInput = registerSchema.safeParse(values);

    if (!validatedInput.success) {
        return {
            success: false,
            error: {
                code: "INVALID_INPUT",
                message: "Please provide valid registration information"
            }
        };
    }

    try {
        const { name, email, password } = validatedInput.data;
        const existingUser = await getUserByEmailQuery(email);

        if (existingUser) {
            return {
                success: false,
                error: {
                    code: "INVALID_INPUT",
                    message: "This email is already registered"
                }
            };
        }

        const hashedPassword = await hash(password, 10);
        await createUserInQuery(name, email, hashedPassword);

        return {
            success: true,
            data: { callbackUrl: LOGIN_URL }
        };
    } catch (error) {
        return {
            success: false,
            error: {
                code: "SERVER_ERROR",
                message: "Failed to create account"
            }
        };
    }
}

/**
 * Helper function to set up 2FA session
 */
async function setup2FASession(redirectUrl: string): Promise<ActionResult<LoginResult>> {
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
            data: {
                requires2FA: true,
                callbackUrl: redirectUrl
            }
        };
    } catch (error) {
        return {
            success: false,
            error: {
                code: "COOKIE_ERROR",
                message: "Failed to set up two-factor authentication"
            }
        };
    }
}