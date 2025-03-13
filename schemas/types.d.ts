export type UnauthorizedResponse = { error: string }

export type User = {
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    lastLogin: Date | null
    loginAttempts: number
}

export type Item = {
    id: string;
    referenceNo: string;
    itemType: string;
    itemStatus: string;
    purpose: string;
    supplier: string;
    oic: boolean;
    date: Date;
}