"use server";

import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma as db } from "@/lib/prisma";
import { auth } from "@/auth";

export async function setup2FA() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const secret = speakeasy.generateSecret({ length: 20 });

    await db.user.update({
        where: { id: session.user.id },
        data: { twoFASecret: secret.base32 },
    });

    const otpAuthUrl = secret.otpauth_url!;
    const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl);

    return { qrCodeDataURL };
}

export async function verify2FA(otp: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { twoFASecret: true },
    });

    if (!user?.twoFASecret) throw new Error("2FA not set up");

    const verified = speakeasy.totp.verify({
        secret: user.twoFASecret.trim(),
        encoding: "base32",
        token: otp,
    });

    if (verified) {
        await db.user.update({
            where: { id: session.user.id },
            data: { is2FAEnabled: true },
        });
        return { success: true };
    } else {
        return { success: false };
    }
}

export async function disable2FA() {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    await db.user.update({
        where: { id: session.user.id },
        data: { twoFASecret: null, is2FAEnabled: false },
    });

    return { success: true };
}
