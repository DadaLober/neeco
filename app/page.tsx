import { BackgroundCarousel } from "@/app/(components)/carousel"
import { LoginCard } from "@/app/(components)/login-card"
import { Toaster } from "@/components/ui/toaster"

export default function Login() {
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