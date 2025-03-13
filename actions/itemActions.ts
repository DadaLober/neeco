"use server";

import { z } from 'zod';
import { auth } from '@/auth';
import { IdSchema } from '@/schemas';
import { isUserOrAdmin } from './roleActions';
import { Item, UnauthorizedResponse } from '@/schemas/types';
import { deleteItemInDB, getAllItemsFromDB, toggleItemOICInDB, updateItemStatusInDB } from './databaseActions';

const statusSchema = z.string().min(1).max(50);

export async function getAllItems(): Promise<Item[] | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    try {
        return getAllItemsFromDB();
    } catch (error) {
        return { error: "Error fetching items" };
    }
}

export async function updateItemStatus(itemId: string, newStatus: string): Promise<Item | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    const validItemId = IdSchema.safeParse(itemId);
    const validStatus = statusSchema.safeParse(newStatus);

    if (!validItemId.success || !validStatus.success) {
        return { error: "Invalid item ID or status" };
    }

    try {
        return updateItemStatusInDB(itemId, newStatus);
    } catch (error) {
        return { error: "Error updating item status" };
    }
}

export async function toggleItemOIC(itemId: string): Promise<Item | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    const validItemId = IdSchema.safeParse(itemId);

    if (!validItemId.success) {
        return { error: "Invalid item ID" };
    }

    try {
        return toggleItemOICInDB(itemId);
    } catch (error) {
        return { error: "Error toggling item OIC" };
    }
}

export async function deleteItem(itemId: string): Promise<Item | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    const validItemId = IdSchema.safeParse(itemId);

    if (!validItemId.success) {
        throw new Error('Invalid item ID');
    }

    try {
        return deleteItemInDB(itemId);
    } catch (error) {
        return { error: "Error deleting item" };
    }
}

