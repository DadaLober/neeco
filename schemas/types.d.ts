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

export type Documents = {
    id: string;
    referenceNo: string;
    documentType: string;
    documentStatus: string;
    purpose: string;
    supplier: string;
    oic: boolean;
    date: Date;
}