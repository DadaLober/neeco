'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "./password-input"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate login
        setTimeout(() => {
            if (email === "test@example.com" && password === "password") {
                console.log("Login successful")
            } else {
                toast({
                    title: "Login Failed",
                    description: "Invalid email or password",
                    variant: "destructive",
                })
            }
            setIsLoading(false)
        }, 2000)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-[#008033]">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded-md border-[#008033] focus:outline-none focus:ring-2 focus:ring-[#E8FE05]"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-[#008033]">
                        Password
                    </Label>
                    <PasswordInput value={password} onChange={setPassword} />
                </div>
            </div>
            <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 bg-[#008033] hover:bg-[#006028] text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#E8FE05] focus:ring-opacity-50"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing In...
                    </div>
                ) : (
                    "Sign In"
                )}
            </Button>
        </form>
    )
}