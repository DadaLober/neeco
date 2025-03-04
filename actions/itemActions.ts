'use server'

import { prisma } from '@/lib/prisma';
import { requireAuth } from './roleActions';
import { revalidatePath } from 'next/cache';

export async function getAllItems() {
    await requireAuth();

    try {
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
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching items');
    }
}

export async function updateItemStatus(itemId: string, newStatus: string) {
    await requireAuth();

    try {
        const updatedItem = await prisma.item.update({
            where: { id: itemId },
            data: { status: newStatus }
        });

        revalidatePath('/admin');
        return updatedItem;
    } catch (error) {
        console.error(error);
        throw new Error('Error updating item status');
    }
}

export async function toggleItemOIC(itemId: string) {
    await requireAuth();

    try {
        const item = await prisma.item.findUnique({
            where: { id: itemId }
        });

        if (!item) return null;

        const updatedItem = await prisma.item.update({
            where: { id: itemId },
            data: { oic: !item.oic }
        });

        revalidatePath('/admin');
        return updatedItem;
    } catch (error) {
        console.error(error);
        throw new Error('Error toggling item OIC');
    }
}

export async function updateItemEmpId(itemId: string, newEmpId: string) {
    await requireAuth();

    try {
        const updatedItem = await prisma.item.update({
            where: { id: itemId },
            data: { empId: newEmpId }
        });

        revalidatePath('/admin');
        return updatedItem;
    } catch (error) {
        console.error(error);
        throw new Error('Error updating item employee ID');
    }
}

export async function deleteItem(itemId: string) {
    await requireAuth();

    try {
        const deletedItem = await prisma.item.delete({
            where: { id: itemId }
        });

        revalidatePath('/admin');
        return deletedItem;
    } catch (error) {
        console.error(error);
        throw new Error('Error deleting item');
    }
}

export async function getItemTypes() {
    await requireAuth();

    try {
        const itemTypes = await prisma.item.findMany({
            select: { itemType: true },
            distinct: ['itemType']
        });

        return itemTypes.map((item) => item.itemType);
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching item types');
    }
}