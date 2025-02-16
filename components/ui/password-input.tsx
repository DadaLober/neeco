"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Input } from "./input"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    showStrengthIndicator?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showStrengthIndicator, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false)

        const togglePassword = () => {
            setShowPassword((prev) => !prev)
        }

        return (
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("pr-10", className)}
                    ref={ref}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={togglePassword}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                </Button>
            </div>
        )
    }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
