export type UnauthorizedResponse = { message: string }

export type User = {
    id: string
    name: string | null
    email: string | null
    role: string
    isActive: boolean
    lastLogin: Date | null
    loginAttempts: number
}