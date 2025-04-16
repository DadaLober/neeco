"use server";

import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { auth } from "@/auth";
import { validateId, otpSchema } from "@/schemas";
import { isUserOrAdmin } from "./roleActions";
import { disable2FAInDB, getUserByIDFromDB, setup2FAInDB, verify2FAInDB } from "./queries";

export async function setup2FA(): Promise<{ qrCodeDataURL: string } | { error: string }> {
    const session = await auth();

    if (!(await isUserOrAdmin(session)) || !session) {
        return { error: "Unauthorrized" };
    }
    const parsedId = validateId.safeParse(session.user.id);

    if (!parsedId.success) {
        return { error: "Invalid user ID" };
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    const base32Secret = secret.base32;

    try {
        await setup2FAInDB(session.user.id, base32Secret);

        const otpAuthUrl = secret.otpauth_url!;
        const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl);

        return { qrCodeDataURL };
    } catch (error) {
        return { error: "Error setting up 2FA" };
    }
}

export async function verify2FA(otp: string): Promise<{ success: boolean } | { error: string }> {
    const session = await auth();

    if (!(await isUserOrAdmin(session)) || !session) {
        return ({ error: "Unauthorrized" });
    }

    const parsedOtp = otpSchema.safeParse(otp);

    if (!parsedOtp.success) {
        return { error: "Invalid OTP format" };
    }

    try {
        const user = await getUserByIDFromDB(session.user.id);

        if (!user) return { error: "User not found" };

        if (!user.twoFASecret) return { error: "2FA not enabled" };

        const verified = speakeasy.totp.verify({
            secret: user.twoFASecret.trim(),
            encoding: "base32",
            token: otp,
        });

        if (!verified) return { error: "Invalid OTP" };

        await verify2FAInDB(session.user.id);

        return { success: true };
    } catch (error) {
        return { error: "Error verifying 2FA" };
    }
}

export async function disable2FA(): Promise<{ success: boolean } | { error: string }> {
    const session = await auth();
    if (!(await isUserOrAdmin(session)) || !session) {
        return { error: "Unauthorrized" };
    }

    const parsedId = validateId.safeParse(session.user.id);

    if (!parsedId.success) {
        return { error: "Invalid user ID" };
    }

    try {
        await disable2FAInDB(session.user.id);
        return { success: true };
    } catch (error) {
        return { error: "Error disabling 2FA" };
    }
}
