"use server";

import { z } from 'zod';
import { auth } from '@/auth';
import { IdSchema } from '@/schemas';
import { isUserOrAdmin } from './roleActions';
import { Documents, UnauthorizedResponse } from '@/schemas/types';
import { deleteDocumentsInDB, getAllDocumentsFromDB, toggleDocumentsOICInDB, updateDocumentsStatusInDB } from './databaseActions';

const statusSchema = z.string().min(1).max(50);

export async function getAllDocuments(): Promise<Documents[] | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    try {
        return getAllDocumentsFromDB();
    } catch (error) {
        return { error: "Error fetching documents" };
    }
}

export async function updateDocumentsStatus(documentId: string, newStatus: string): Promise<Documents | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    const validDocumentsId = IdSchema.safeParse(documentId);
    const validStatus = statusSchema.safeParse(newStatus);

    if (!validDocumentsId.success || !validStatus.success) {
        return { error: "Invalid document ID or status" };
    }

    try {
        return updateDocumentsStatusInDB(documentId, newStatus);
    } catch (error) {
        return { error: "Error updating document status" };
    }
}

export async function toggleDocumentsOIC(documentId: string): Promise<Documents | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    const validDocumentsId = IdSchema.safeParse(documentId);

    if (!validDocumentsId.success) {
        return { error: "Invalid document ID" };
    }

    try {
        return toggleDocumentsOICInDB(documentId);
    } catch (error) {
        return { error: "Error toggling document OIC" };
    }
}

export async function deleteDocuments(documentId: string): Promise<Documents | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    const validDocumentsId = IdSchema.safeParse(documentId);

    if (!validDocumentsId.success) {
        throw new Error('Invalid document ID');
    }

    try {
        return deleteDocumentsInDB(documentId);
    } catch (error) {
        return { error: "Error deleting document" };
    }
}

