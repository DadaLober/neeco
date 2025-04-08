import { z } from "zod";

// Document type
export const DocumentTypeSchema = z.string().refine(
    (val) => ['APV', 'BOM', 'BR', 'CA', 'COC', 'CV', 'ICT', 'IS', 'KMCT', 'MC', 'MRV', 'PM',
        'PO', 'RET', 'RM', 'RR', 'RS', 'RV', 'SA', 'SOP', 'ST', 'TMZ', 'TO', 'TOA'].includes(val),
    { message: "Invalid document type" }
);

// Document status
export const DocumentStatusSchema = z.string().refine(
    (val) => ['APP', 'AUD', 'CHK', 'CON', 'FPO', 'NOC', 'NOT', 'PRV', 'RCV', 'REC', 'REQ', 'VER'].includes(val),
    { message: "Invalid document status" }
);

// Custom validators
export function isValidISODate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}

export function isValidBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return true;
    if (typeof value === "string") {
        return value.toLowerCase() === "true" || value.toLowerCase() === "false";
    }
    return false;
}

export const DocumentSchema = z.object({
    referenceNo: z.string().min(1, "Reference number is required"),
    documentType: DocumentTypeSchema,
    documentStatus: DocumentStatusSchema,
    purpose: z.string().min(1, "Purpose is required"),
    supplier: z.string().min(1, "Supplier is required"),
    oic: z.union([
        z.boolean(),
        z.string().refine(isValidBoolean, {
            message: "OIC must be a boolean value (true/false)"
        }).transform(val => val.toLowerCase() === "true")
    ]),
    date: z.union([
        z.date(),
        z.string()
            .refine(isValidISODate, { message: "Date must be a valid ISO 8601 string" })
            .transform(val => new Date(val))
    ]),
    departmentId: z.union([
        z.number().nullable(),
        z.string()
            .optional()
            .refine(val => val === undefined || val === null || val.trim() !== "", {
                message: "DepartmentId should not be empty if present",
            })
            .transform(val => {
                if (val === undefined || val === null || val.trim() === "") {
                    return null;
                }
                return Number(val);
            })
            .refine(val => val === null || !isNaN(val), {
                message: "DepartmentId must be a number if provided",
            })
    ])
});

export const DocumentsSchema = z.array(DocumentSchema)
    .min(1, "At least one document is required")
    .max(500, "Maximum 500 documents can be processed at once");

export type Document = z.infer<typeof DocumentSchema>;
export type Documents = z.infer<typeof DocumentsSchema>;

export interface ValidationError {
    line: number;
    message: string;
    row: string;
}

export interface FileAnalysis {
    projectedRows: number;
    invalidRows: number;
    errors: ValidationError[];
    analyzed: boolean;
}

export function analyzeFileContent(content: string): FileAnalysis {
    const rows = content.split("\n").filter((row) => row.trim().length > 0);
    const errors: ValidationError[] = [];
    let validRows = 0;

    rows.forEach((rawRow, index) => {
        const lineNumber = index + 1;

        // Split and clean quotes
        const columns = rawRow
            .split(";")
            .map((col) => col.trim().replace(/^"|"$/g, ""));

        if (columns.length < 7 || columns.length > 8) {
            errors.push({
                line: lineNumber,
                message: `Expected 7-8 columns, found ${columns.length}`,
                row: rawRow,
            });
            return;
        }

        const [
            referenceNo,
            documentType,
            documentStatus,
            purpose,
            supplier,
            oic,
            dateStr,
            departmentId,
        ] = columns;

        const result = DocumentSchema.safeParse({
            referenceNo,
            documentType,
            documentStatus,
            purpose,
            supplier,
            oic,
            date: dateStr,
            departmentId,
        });

        if (!result.success) {
            const message = result.error.errors
                .map(err => `${err.path.join('.')}: ${err.message}`)
                .join(', ');

            errors.push({
                line: lineNumber,
                message,
                row: rawRow,
            });
            return;
        }

        validRows++;
    });

    return {
        projectedRows: validRows,
        invalidRows: errors.length,
        errors,
        analyzed: true,
    };
}