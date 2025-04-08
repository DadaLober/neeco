"use server";

import { z } from 'zod';
import { auth } from '@/auth';
import { IdSchema, UnauthorizedResponse } from '@/schemas';
import { isUserOrAdmin } from './roleActions';
import { addDocumentsInDB, deleteDocumentsInDB, getAllDocumentsFromDB, toggleDocumentsOICInDB, updateDocumentStatusInDB } from './queries';
import { Documents } from '@prisma/client';
import { DocumentsSchema } from '@/schemas/validateDocument';

const statusSchema = z.string().min(1).max(50);

export async function getAllDocuments(): Promise<Partial<Documents>[] | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    return getAllDocumentsFromDB();
}

export async function updateDocumentStatus(documentId: string, newStatus: string): Promise<Documents | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    const validDocumentsId = IdSchema.safeParse(documentId);
    const validStatus = statusSchema.safeParse(newStatus);

    if (!validDocumentsId.success || !validStatus.success) {
        return { error: "Invalid document ID or status" };
    }

    return updateDocumentStatusInDB(documentId, newStatus);
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

    return toggleDocumentsOICInDB(documentId);
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

    return deleteDocumentsInDB(documentId);
}

export async function addDocuments(documents: unknown): Promise<number | UnauthorizedResponse> {
    const session = await auth();

    if (!(await isUserOrAdmin(session))) {
        return { error: "Unauthorized" };
    }

    try {
        const parseResult = DocumentsSchema.safeParse(documents);

        if (!parseResult.success) {
            return {
                error: "Validation failed: " + parseResult.error.errors
                    .map(err => `${err.path.join('.')}: ${err.message}`)
                    .join(', ')
            };
        }

        const validatedDocuments = parseResult.data;

        return await addDocumentsInDB(validatedDocuments);
    } catch (error) {
        console.error("Error processing documents:", error);
        return { error: "Failed to process documents - " + error };
    }
}