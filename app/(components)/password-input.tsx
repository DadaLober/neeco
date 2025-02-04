'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

export function PasswordInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="relative">
            <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md border-[#008033] focus:outline-none focus:ring-2 focus:ring-[#E8FE05] pr-10"
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-[#008033]"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    )
}