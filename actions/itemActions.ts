"use server";

import { auth } from '@/auth';
import { z } from 'zod';
import { IdSchema } from '@/schemas';
import { isUserOrAdmin } from './roleActions';
import { Item, UnauthorizedResponse } from '@/schemas/types';

const statusSchema = z.string().min(1).max(50);

export async function getAllItems(
    getAllItems: () => Promise<Item[]>
): Promise<Item[] | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" }
    }

    try {
        return getAllItems();

    } catch (error) {
        console.error(error);
        return { error: "Error fetching items" };
    }
}

export async function updateItemStatus(
    itemId: string,
    newStatus: string,
    updateItemStatus: () => Promise<Item>
): Promise<Item | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" }
    }

    const validItemId = IdSchema.safeParse(itemId);
    const validStatus = statusSchema.safeParse(newStatus);

    if (!validItemId.success || !validStatus.success) {
        throw new Error('Invalid input');
    }

    try {
        return updateItemStatus();
    } catch (error) {
        console.error(error);
        throw new Error('Error updating item status');
    }
}

export async function toggleItemOIC(
    itemId: string,
    toggleItemOIC: () => Promise<Item | UnauthorizedResponse>
): Promise<Item | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" }
    }

    const validItemId = IdSchema.safeParse(itemId);

    if (!validItemId.success) {
        return { error: "Invalid item ID" };
    }

    try {
        return toggleItemOIC();
    } catch (error) {
        console.error(error);
        throw new Error('Error toggling item OIC');
    }
}

export async function deleteItem(
    itemId: string,
    deleteItem: () => Promise<Item | UnauthorizedResponse>
): Promise<Item | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" }
    }

    const validItemId = IdSchema.safeParse(itemId);

    if (!validItemId.success) {
        throw new Error('Invalid item ID');
    }

    try {
        return await deleteItem();
    } catch (error) {
        console.error(error);
        throw new Error('Error deleting item');
    }
}

