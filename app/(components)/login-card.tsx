import { LoginForm } from "./form"

import GithubSignIn from "./github-sign-in"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

export function LoginCard() {
    return (
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl rounded-lg">
            <CardHeader className="space-y-1 flex flex-col items-center">
                <div className="mb-4 relative w-48 h-16">
                    <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <CardTitle className="text-2xl font-bold text-[#008033]">Welcome Back</CardTitle>
                <p className="text-sm text-gray-600">Please sign in to your account</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <LoginForm />
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                <div className="w-full">
                    <GithubSignIn />
                </div>
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
        </Card >
    )
}