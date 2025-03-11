"use server";

import { prisma } from '@/lib/prisma';
import { auth as requireAuth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { IdSchema } from '@/schemas';

const statusSchema = z.string().min(1).max(50);

export async function getAllItems() {
    await requireAuth();

    try {
        return prisma.item.findMany({
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
    } catch (error) {
        console.error(error);
        throw new Error('Error fetching items');
    }
}

export async function updateItemStatus(itemId: string, newStatus: string) {
    await requireAuth();

    const validItemId = IdSchema.safeParse(itemId);
    const validStatus = statusSchema.safeParse(newStatus);
    if (!validItemId.success || !validStatus.success) {
        throw new Error('Invalid input');
    }

    try {
        const updatedItem = await prisma.item.update({
            where: { id: itemId },
            data: { itemStatus: newStatus }
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

    const validItemId = IdSchema.safeParse(itemId);
    if (!validItemId.success) {
        throw new Error('Invalid item ID');
    }

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

export async function deleteItem(itemId: string) {
    await requireAuth();

    const validItemId = IdSchema.safeParse(itemId);
    if (!validItemId.success) {
        throw new Error('Invalid item ID');
    }

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

