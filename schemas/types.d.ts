export type UnauthorizedResponse = { message: string }

export type User = {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    lastLogin: Date | null
    loginAttempts: number
}