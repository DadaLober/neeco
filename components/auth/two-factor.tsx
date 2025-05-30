"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { complete2FALogin } from "@/actions/authActions"
import { verify2FA } from "@/actions/twoFactorActions"
import { Button } from "@/components/ui/button"
import OTPInput from "./input-otp"

export function TwoFactorVerification() {
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""))
    const [error, setError] = useState<string | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)
    const router = useRouter()

    // Memoize resetOtp to prevent unnecessary recreations
    const resetOtp = useCallback(() => {
        setOtp(new Array(6).fill(""))
    }, [])

    // Handle OTP change from child component
    const handleOtpChange = (newOtp: string[]) => {
        setOtp(newOtp)

        // Clear previous errors when user types
        if (error) setError(null)
    }

    // Memoize handleVerify with dependencies on otp and resetOtp
    const handleVerify = useCallback(async () => {
        try {
            setIsVerifying(true)

            const otpString = otp.join("")
            const result = await verify2FA(otpString)

            if (result) {
                const loginResult = await complete2FALogin()

                if (!loginResult.success) {
                    setError(loginResult.error.message)
                    resetOtp()
                    return
                }

                router.push(loginResult.data.callbackUrl)

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
    }, [otp, resetOtp, router]) // Include dependencies used inside handleVerify

    // Auto-submit when all digits are filled
    useEffect(() => {
        if (otp.every(digit => digit !== "")) {
            handleVerify()
        }
    }, [otp, handleVerify]) // Dependencies are now stable

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
                variant="default"
            >
                {isVerifying ? "Verifying..." : "Verify"}
            </Button>
        </div>
    )
}