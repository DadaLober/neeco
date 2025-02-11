import { BackgroundCarousel } from "@/app/(components)/carousel"
import { AuthCard } from "@/app/(components)/login-register-card"
import { Toaster } from "@/components/ui/toaster"
import { RegisterForm } from "@/app/(components)/register-form";

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
                        title="Create an account"
                        subtitle="Enter your details to create an account"
                        form={<RegisterForm />}
                        mode="register"
                    />
                </div>
            </div>
            <Toaster />
        </>
    )
}