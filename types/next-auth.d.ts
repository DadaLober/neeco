// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role: string
    is2FAEnabled: boolean
    isTwoFactorVerified?: boolean
  }

  interface Session {
    user: {
      id: string
      role: string
      is2FAEnabled: boolean
      isTwoFactorVerified?: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    is2FAEnabled: boolean
    isTwoFactorVerified?: boolean
  }
}