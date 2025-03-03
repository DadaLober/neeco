'use server'

import { auth } from '@/auth';
import { isAdmin } from './roleActions';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAllItems() {

    return prisma.item.findMany({
        select: {
            id: true,
            referenceNo: true,
            itemType: true,
            status: true,
            empId: true,
            oic: true,
            date: true,
            time: true,
        },
        orderBy: { date: 'desc' }
    });
}

export async function updateItemStatus(itemId: string, newStatus: string) {

    const updatedItem = await prisma.item.update({
        where: { id: itemId },
        data: { status: newStatus }
    });

    revalidatePath('/admin');
    return updatedItem;
}

export async function toggleItemOIC(itemId: string) {

    const item = await prisma.item.findUnique({
        where: { id: itemId }
    });

    if (!item) {
        throw new Error('Item not found');
    }

    const updatedItem = await prisma.item.update({
        where: { id: itemId },
        data: { oic: !item.oic }
    });

    revalidatePath('/admin');
    return updatedItem;
}

export async function updateItemEmpId(itemId: string, newEmpId: string) {
    const session = await auth();
    const userRole = session?.user?.role;

    if (!(await isAdmin(userRole))) {
        throw new Error('Unauthorized: Admin access required');
    }

    const updatedItem = await prisma.item.update({
        where: { id: itemId },
        data: { empId: newEmpId }
    });

    revalidatePath('/admin');
    return updatedItem;
}

export async function deleteItem(itemId: string) {
    const session = await auth();
    const userRole = session?.user?.role;

    if (!(await isAdmin(userRole))) {
        throw new Error('Unauthorized: Admin access required');
    }

    const deletedItem = await prisma.item.delete({
        where: { id: itemId }
    });

    revalidatePath('/admin');
    return deletedItem;
}

export async function getItemTypes() {
    const itemTypes = await prisma.item.findMany({
        select: { itemType: true },
        distinct: ['itemType']
    });

    return itemTypes.map((item) => item.itemType);
}