import NextAuth from "next-auth"
import { Adapter } from "next-auth/adapters"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { z } from "zod"


const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const result = credentialsSchema.safeParse(credentials)

          if (!result.success) {
            return null
          }

          const { email, password } = result.data

          const user = await prisma.user.findUnique({
            where: { email }
          })

          if (!user?.password) {
            return null
          }

          const isPasswordValid = await compare(password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            is2FAEnabled: user.is2FAEnabled,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      session.user.role = token.role as string
      session.user.is2FAEnabled = token.is2FAEnabled as boolean
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.is2FAEnabled = user.is2FAEnabled
      }
      return token
    }
  },
})
