import GithubSignIn from "./github-sign-in";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { FooterLinks } from "./footer";

type AuthCardProps = {
    title: string;
    subtitle?: string;
    form: React.ReactNode;
    mode: 'login' | 'register';
}

export function AuthCard({ title, subtitle, form, mode }: AuthCardProps) {
    return (
        <Card className="w-full max-w-4xl bg-white/90 backdrop-blur-sm shadow-xl rounded-lg flex flex-col md:flex-row">
            {/* Left Column */}
            <div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-[#008033] to-[#1cb86a] text-white">
                <div className="relative w-48 md:w-72 h-16 md:h-20 mb-4 md:mb-6">
                    <Image src="/logo.png" alt="Logo" fill className="object-contain" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-white text-center">{title}</CardTitle>
                <p className="text-xs md:text-sm text-white/80 mt-2 text-center">{subtitle}</p>
            </div>

            {/* Right Column */}
            <div className="w-full md:w-1/2 p-4 md:p-8">
                <CardContent className="space-y-4">
                    {form}
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
                <CardFooter className="flex flex-col items-center mt-4 md:mt-6">
                    <FooterLinks mode={mode} />
                </CardFooter>
            </div>
        </Card>
    );
}
