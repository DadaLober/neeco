"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { complete2FALogin } from "@/actions/authActions"
import { verify2FA } from "@/actions/twoFactorAuth"
import { Button } from "@/components/ui/button"
import OTPInput from "./input-otp"

export function TwoFactorVerification() {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""))
    const [error, setError] = useState<string | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

    // Handle OTP change from child component
    const handleOtpChange = (newOtp: string[]) => {
        setOtp(newOtp)

        // Clear previous errors when user types
        if (error) setError(null)
    }

    // Auto-submit when all digits are filled
    useEffect(() => {
        if (otp.every(digit => digit !== "")) {
            handleVerify()
        }
    }, [otp])

    const handleVerify = async () => {
        try {
            setIsVerifying(true)

            const otpString = otp.join("")
            const result = await verify2FA(otpString)

            if (result.success) {
                // 2FA verification successful, complete the login process
                const loginResult = await complete2FALogin(callbackUrl)

                if (loginResult.success) {
                    router.push(loginResult.url || "/dashboard")
                } else {
                    setError(loginResult.error || "Failed to complete login process")
                    resetOtp()
                }
            } else {
                setError("Invalid verification code. Please try again.")
                resetOtp()
            }
        } catch (error) {
            console.error("2FA verification error:", error)
            setError("An error occurred during verification. Please try again.")
            resetOtp()
        } finally {
            setIsVerifying(false)
        }
    }

    const resetOtp = () => {
        setOtp(new Array(6).fill(""))
    }

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
                <p className="text-muted-foreground">
                    Enter the 6-digit code from your authenticator app
                </p>
            </div>

            {error && (
                <div className="w-full rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <OTPInput value={otp} onChange={handleOtpChange} />

            <Button
                onClick={handleVerify}
                disabled={otp.some(digit => digit === "") || isVerifying}
                className="w-full"
                variant="green"
            >
                {isVerifying ? "Verifying..." : "Verify"}
            </Button>
        </div>
    )
}