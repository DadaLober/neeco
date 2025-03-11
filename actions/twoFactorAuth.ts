"use server";

import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { otpSchema } from "@/schemas";

export async function setup2FA() {
    const session = await auth();
    const secret = speakeasy.generateSecret({ length: 20 });

    try {
        await prisma.user.update({
            where: { id: session?.user.id },
            data: { twoFASecret: secret.base32 },
        });

        const otpAuthUrl = secret.otpauth_url!;
        const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl);

        return { qrCodeDataURL };
    } catch (error) {
        console.error("Error setting up 2FA:", error);
        throw new Error("Error setting up 2FA");
    }
}

export async function verify2FA(otp: string) {
    const session = await auth();
    const parsedOtp = otpSchema.safeParse(otp);

    if (!parsedOtp.success) {
        return { success: false, error: "Invalid OTP format" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session?.user.id },
            select: { twoFASecret: true },
        });

        if (!user?.twoFASecret) throw new Error("2FA not set up");

        const verified = speakeasy.totp.verify({
            secret: user.twoFASecret.trim(),
            encoding: "base32",
            token: otp,
        });

        if (verified) {
            await prisma.user.update({
                where: { id: session?.user.id },
                data: { is2FAEnabled: true },
            });
            return { success: true };
        } else {
            return { success: false };
        }
    } catch (error) {
        console.error("Error verifying 2FA:", error);
        throw new Error("Error verifying 2FA");
    }
}

export async function disable2FA() {
    const session = await auth();
    try {
        await prisma.user.update({
            where: { id: session?.user.id },
            data: { twoFASecret: null, is2FAEnabled: false },
        });

        return { success: true };
    } catch (error) {
        console.error("Error disabling 2FA:", error);
        throw new Error("Error disabling 2FA");
    }
}
