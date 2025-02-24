import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    is2FAEnabled?: boolean
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      role?: string
      image?: string
      is2FAEnabled?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    is2FAEnabled?: boolean
  }
}
