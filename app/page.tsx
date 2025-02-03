"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

const agmaImages = ["/agma.jpg", "/coop.jpg", "/fire.jpg", "/sustain.jpg", "/women.jpg"]

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % agmaImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background gradient and image container */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8FE05] to-[#008033]">
          {/* Carousel of transparent overlay images */}
          {agmaImages.map((src, index) => (
            <Image
              key={src}
              src={src || "/agma.jpg"}
              alt={`AGMA background ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-30" : "opacity-0"
                }`}
            />
          ))}
        </div>
        {/* Login card */}
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl rounded-lg">
            <CardHeader className="space-y-1 flex flex-col items-center">
              {/* Logo */}
              <div className="mb-4 relative w-48 h-16">
                <Image src="/logo.png" alt="Logo" layout="fill" objectFit="contain" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#008033]">Welcome Back</CardTitle>
              <p className="text-sm text-gray-600">Please sign in to your account</p>
            </CardHeader>
            <CardContent>
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
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded-md border-[#008033] focus:outline-none focus:ring-2 focus:ring-[#E8FE05] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-[#008033]"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
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
        </div>
      </div>
      <Toaster /></>
  )
}