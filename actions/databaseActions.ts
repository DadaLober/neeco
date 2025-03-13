import { prisma } from '@/lib/prisma';
import { Item, UnauthorizedResponse, User } from '@/schemas/types';

//Database functions
export async function setRoleInDB(userId: string, role: string): Promise<User> {
    return await prisma.user.update({
        where: { id: userId },
        data: { role: role }
    });
}

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

export async function getAllItemsFromDB() {
    return await prisma.item.findMany({
        select: {
            id: true,
            referenceNo: true,
            itemType: true,
            itemStatus: true,
            purpose: true,
            supplier: true,
            oic: true,
            date: true,
        },
        orderBy: { date: 'desc' }
    });
}

export async function toggleItemOICInDB(itemId: string): Promise<Item | UnauthorizedResponse> {
    const item = await prisma.item.findUnique({
        where: { id: itemId }
    });

    if (!item) {
        return { error: "Item not found" };
    }

    return await prisma.item.update({
        where: { id: itemId },
        data: { oic: !item.oic }
    });
}

export async function updateItemStatusInDB(itemId: string, newStatus: string): Promise<Item> {
    return await prisma.item.update({
        where: { id: itemId },
        data: { itemStatus: newStatus }
    });
}

export async function deleteItemInDB(itemId: string): Promise<Item | UnauthorizedResponse> {
    return await prisma.item.delete({
        where: { id: itemId }
    });
}