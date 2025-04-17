'use server';

import {
    setDocumentsQuery,
    DocumentWithRelations,
    getAllDocumentsQuery,
} from './queries';
import { DocumentsSchema } from '@/schemas/validateDocument';
import { checkAdminAccess, checkUserAccess } from './roleActions';
import { ActionResult } from '@/schemas';
import { Documents } from '@prisma/client';

/**
 * Retrieves all documents with their relations
 */
export async function getAllDocuments(): Promise<ActionResult<DocumentWithRelations[]>> {
    const userError = await checkUserAccess();
    if (userError) {
        return { success: false, error: userError };
    }

    try {
        const documents = await getAllDocumentsQuery();
        return { success: true, data: documents };
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'DATABASE_ERROR',
                message: 'Failed to fetch documents',
            },
        };
    }
}

/**
 * Adds new document/s
 */
export async function addDocuments(
    documents: Omit<Documents, "id">[]
): Promise<ActionResult<number>> {
    const adminError = await checkAdminAccess();
    if (adminError) {
        return { success: false, error: adminError };
    }

    const parseResult = DocumentsSchema.safeParse(documents);
    if (!parseResult.success) {
        return {
            success: false,
            error: {
                code: 'INVALID_INPUT',
                message: parseResult.error.errors
                    .map((err) => `${err.path.join('.')}: ${err.message}`)
                    .join(', '),
            },
        };
    }

    try {
        const validatedDocuments = parseResult.data;
        const insertedCount = await setDocumentsQuery(validatedDocuments);
        return { success: true, data: insertedCount };
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'DATABASE_ERROR',
                message: 'Failed to add documents',
            },
        };
    }
}