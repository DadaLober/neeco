import { prisma } from '@/lib/prisma';
import { Documents, UnauthorizedResponse, User } from '@/schemas/types';

//Database functions

export async function getAllUsersFromDB(): Promise<User[]> {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true,
            loginAttempts: true,
        },
    })
}

export async function deleteUserFromDB(userId: string): Promise<User> {
    return await prisma.user.delete({
        where: { id: userId },
    });
}

export async function getUserByEmailFromDB(email: string): Promise<User & { is2FAEnabled: boolean } | null> {
    return await prisma.user.findUnique({
        where: { email: email },
    })
}

export async function getUserByIDFromDB(userId: string): Promise<User & { twoFASecret: string | null } | null> {
    return await prisma.user.findUnique({
        where: { id: userId },
    });
}

export async function setRoleInDB(userId: string, role: string): Promise<User> {
    return await prisma.user.update({
        where: { id: userId },
        data: { role: role }
    });
}

export async function setLastLoginInDB(email: string): Promise<User> {
    return await prisma.user.update({
        where: { email: email },
        data: { lastLogin: new Date() }
    });
}

export async function setLoginAttemptsInDB(email: string): Promise<User> {
    return await prisma.user.update({
        where: { email: email },
        data: { loginAttempts: { increment: 1 } }
    });
}

export async function createUserInDB(name: string, email: string, role: string, password: string): Promise<User> {
    return await prisma.user.create({
        data: {
            name: name,
            email: email,
            role: role,
            password: password,
        },
    });
}

export async function getAllDocumentsFromDB() {
    return await prisma.documents.findMany({
        select: {
            id: true,
            referenceNo: true,
            documentType: true,
            documentStatus: true,
            purpose: true,
            supplier: true,
            oic: true,
            date: true,
        },
        orderBy: { date: 'desc' }
    });
}

export async function toggleDocumentsOICInDB(documentsId: string): Promise<Documents | UnauthorizedResponse> {
    const documents = await prisma.documents.findUnique({
        where: { id: documentsId }
    });

    if (!documents) {
        return { error: "documents not found" };
    }

    return await prisma.documents.update({
        where: { id: documentsId },
        data: { oic: !documents.oic }
    });
}

export async function updateDocumentsStatusInDB(documentsId: string, newStatus: string): Promise<Documents> {
    return await prisma.documents.update({
        where: { id: documentsId },
        data: { documentStatus: newStatus }
    });
}

export async function deleteDocumentsInDB(documentsId: string): Promise<Documents | UnauthorizedResponse> {
    return await prisma.documents.delete({
        where: { id: documentsId }
    });
}

export async function setup2FAInDB(userId: string, twoFASecret: string): Promise<User> {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            twoFASecret: twoFASecret
        },
    });
}

export async function verify2FAInDB(userId: string): Promise<User> {
    return await prisma.user.update({
        where: { id: userId },
        data: { is2FAEnabled: true },
    });
}

export function disable2FAInDB(userId: string): Promise<User> {
    return prisma.user.update({
        where: { id: userId },
        data: { is2FAEnabled: false, twoFASecret: null },
    });
}