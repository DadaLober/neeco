import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { LoginForm } from "./login-form"

export function LoginCard() {
    return (
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl rounded-lg">
            <CardHeader className="space-y-1 flex flex-col items-center">
                <div className="mb-4 relative w-48 h-16">
                    <Image src="/logo.png" alt="Logo" layout="fill" objectFit="contain" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#008033]">Welcome Back</CardTitle>
                <p className="text-sm text-gray-600">Please sign in to your account</p>
            </CardHeader>
            <CardContent>
                <LoginForm />
            </CardContent>
            <CardFooter className="flex flex-col items-center">
                <p className="text-center text-sm text-[#008033] mt-4">
                    Don&apos;t have an account?{" "}
                    <a href="#" className="font-semibold hover:underline text-[#008033]">
                        Sign up
                    </a>
                </p>
                <p className="text-center text-sm text-[#008033] mt-2">
                    <a href="#" className="font-semibold hover:underline text-[#008033]">
                        Forgot password?
                    </a>
                </p>
            </CardFooter>
        </Card>
    )
}