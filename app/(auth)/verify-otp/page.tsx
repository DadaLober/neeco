// app/two-factor-auth/page.tsx
import { TwoFactorVerification } from "@/components/auth/two-factor"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function TwoFactorAuthPage() {
    const session = await auth()

    // If user is not logged in, redirect to login
    if (!session?.user) {
        redirect("/login")
    }

    // If user doesn't have 2FA enabled, redirect to dashboard
    if (!session.user.is2FAEnabled) {
        redirect("/dashboard")
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <TwoFactorVerification />
            </div>
        </div>
    )
}