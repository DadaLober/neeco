import NextAuth from "next-auth"
import Github from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Github,
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                // Replace with your own user authentication logic (e.g., database lookup)
                if (credentials.email === "test@example.com" && credentials.password === "password") {
                    return { id: "1", name: "Test User", email: "test@example.com" };
                }

                throw new Error("Invalid email or password");
            },
        }),
    ],
})

