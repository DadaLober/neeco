import { BackgroundCarousel } from "@/app/(components)/carousel"
import { AuthCard } from "@/app/(components)/login-register-card"
import { Toaster } from "@/components/ui/toaster"
import { LoginForm } from "@/app/(components)/login-form";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {

    const session = await auth();
    if (session) redirect("/dashboard");

    return (
        <>
            <div className="min-h-screen relative overflow-hidden">
                <BackgroundCarousel />
                <div className="relative min-h-screen flex items-center justify-center p-4">

                    <AuthCard
                        title="Welcome back"
                        subtitle="Enter your email and password to sign in to your account"
                        form={<LoginForm />}
                        mode="login"
                    />
                </div>
            </div>
            <Toaster />
        </>
    )
}