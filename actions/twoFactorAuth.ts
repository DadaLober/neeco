"use server";

import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { auth } from "@/auth";
import { validateId, otpSchema, ActionResult } from "@/schemas";
import { checkUserAccess } from "./roleActions";
import { disable2FAQuery, getUserByIDQuery, setup2FAQuery, verify2FAQuery } from "./queries";

/**
 * Sets up two-factor authentication for the current user
 * Generates a secret and QR code for the user to scan
 */
export async function setup2FA(): Promise<ActionResult<{ qrCodeDataURL: string }>> {
    const result = await checkUserAccess();
    if (!result.success) {
        return { success: false, error: result.error };
    }

    const parsedId = validateId.safeParse(result.data.user.id);
    if (!parsedId.success) {
        return {
            success: false,
            error: {
                code: 'INVALID_INPUT',
                message: 'Invalid user ID format'
            }
        };
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    const base32Secret = secret.base32;

    try {
        await setup2FAQuery(result.data.user.id, base32Secret);

        const otpAuthUrl = secret.otpauth_url!;
        const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl);

        return { success: true, data: { qrCodeDataURL } };
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'DATABASE_ERROR',
                message: 'Error setting up 2FA'
            }
        };
    }
}

/**
 * Verifies a one-time password for 2FA and enables 2FA for the user if valid
 */
export async function verify2FA(otp: string): Promise<ActionResult<boolean>> {
    const result = await checkUserAccess();
    if (!result.success) {
        return { success: false, error: result.error };
    }

    const parsedOtp = otpSchema.safeParse(otp);
    if (!parsedOtp.success) {
        return {
            success: false,
            error: {
                code: 'INVALID_INPUT',
                message: 'Invalid OTP format'
            }
        };
    }

    try {
        const user = await getUserByIDQuery(result.data.user.id);

        if (!user) {
            return {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'User not found'
                }
            };
        }

        if (!user.twoFASecret) {
            return {
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '2FA not enabled'
                }
            };
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFASecret.trim(),
            encoding: "base32",
            token: otp,
        });

        if (!verified) {
            return {
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Invalid OTP'
                }
            };
        }

        await verify2FAQuery(result.data.user.id);

        return { success: true, data: true };
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'DATABASE_ERROR',
                message: 'Error verifying 2FA'
            }
        };
    }
}

/**
 * Disables two-factor authentication for the current user
 */
export async function disable2FA(): Promise<ActionResult<boolean>> {
    const userError = await checkUserAccess();
    if (!userError.success) {
        return { success: false, error: userError.error };
    }

    const session = await auth();
    if (!session) {
        return {
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required'
            }
        };
    }

    const parsedId = validateId.safeParse(session.user.id);
    if (!parsedId.success) {
        return {
            success: false,
            error: {
                code: 'INVALID_INPUT',
                message: 'Invalid user ID format'
            }
        };
    }

    try {
        await disable2FAQuery(session.user.id);
        return { success: true, data: true };
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'DATABASE_ERROR',
                message: 'Error disabling 2FA'
            }
        };
    }
}