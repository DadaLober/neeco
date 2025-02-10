import { BackgroundCarousel } from "@/app/(components)/carousel"
import { LoginCard } from "@/app/(components)/login-card"
import { Toaster } from "@/components/ui/toaster"

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Login() {

  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        <BackgroundCarousel />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <LoginCard />
        </div>
      </div>
      <Toaster />
    </>
  )
}