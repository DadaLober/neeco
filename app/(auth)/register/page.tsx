import { auth } from "@/auth"
import { RegisterForm } from "@/components/auth/register-form"
import Carousel from "@/components/auth/carousel"
import Image from "next/image"
import { redirect } from "next/navigation"

export default async function RegisterPage() {
    const session = await auth()

    if (session) {
        redirect("/")
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="w-full flex justify-center mt-4 sm:mt-8 lg:mt-0">
                    <a href="#" className="flex items-center">
                        <Image
                            src="/logo.png"
                            alt="logo"
                            width={366}
                            height={101}
                            className="w-[250px] md:w-[300px] lg:w-[366px] h-auto"
                            priority
                        />
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <RegisterForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <Carousel />
            </div>
        </div>
    )
}
