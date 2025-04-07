import { z } from "zod"

export type UnauthorizedResponse = { error: string }

export function validateRole(role: string): string | null {
    const parsedRole = UserRoleSchema.safeParse(role);
    return parsedRole.success ? parsedRole.data : null;
}

export const UserRoleSchema = z.enum(['USER', 'ADMIN']);
export const IdSchema = z.string().cuid()
export const otpSchema = z.string().length(6).regex(/^[0-9]+$/);
export const numberSchema = z.number().min(1);
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
})
export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export const DocumentTypeSchema = z.enum(['APV', 'BOM', 'BR', 'CA', 'COC', 'CV', 'ICT', 'IS', 'KMCT', 'MC', 'MRV', 'PM',
    'PO', 'RET', 'RM', 'RR', 'RS', 'RV', 'SA', 'SOP', 'ST', 'TMZ', 'TO', 'TOA']);

export const DocumentStatusSchema = z.enum(['APP', 'AUD', 'CHK', 'CON', 'FPO', 'NOC', 'NOT', 'PRV', 'RCV', 'REC', 'REQ', 'VER']);

// File validation schemas and types
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

// Schema for file row format
export const fileRowSchema = z.object({
    referenceNo: z.string().min(1, "Reference number is required"),
    documentType: DocumentTypeSchema,
    documentStatus: DocumentStatusSchema,
    purpose: z.string().min(1, "Purpose is required"),
    supplier: z.string().min(1, "Supplier is required"),
    oic: z.string().refine(
        val => val.toLowerCase() === 'true' || val.toLowerCase() === 'false',
        { message: "OIC must be a boolean value (true/false)" }
    ),
    date: z.string().refine(
        val => isValidISODate(val),
        { message: "Date must be a valid ISO string (e.g., 2025-04-07T12:00:00Z)" }
    ),
    departmentId: z.number().optional()
});

export function isValidISODate(dateStr: string): boolean {
    try {
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(dateStr)) {
            return false;
        }
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    } catch (e) {
        return false;
    }
}

export function isValidBoolean(value: string): boolean {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
}

// File content validation function
export function analyzeFileContent(content: string): FileAnalysis {
    try {
        // Split content by new lines
        const rows = content.split('\n').filter(row => row.trim().length > 0);

        let validRows = 0;
        let errors: ValidationError[] = [];

        // Check each row against expected format
        rows.forEach((row, index) => {
            const lineNumber = index + 1;
            const columns = row.split(';');

            // Check if the row has the expected number of columns (7 required + 1 optional)
            if (columns.length < 7 || columns.length > 8) {
                errors.push({
                    line: lineNumber,
                    message: `Expected 7-8 columns, found ${columns.length}`,
                    row
                });
                return;
            }

            // Extract values
            const [referenceNo, documentType, documentStatus, purpose, supplier, oic, dateStr, departmentId] = columns;

            // Validate with Zod schema
            const result = fileRowSchema.safeParse({
                referenceNo,
                documentType,
                documentStatus,
                purpose,
                supplier,
                oic,
                date: dateStr,
                departmentId: departmentId || undefined
            });

            if (!result.success) {
                // Extract error message from Zod validation
                const errorMessage = result.error.errors[0]?.message || "Invalid row format";
                errors.push({
                    line: lineNumber,
                    message: errorMessage,
                    row
                });
                return;
            }

            // departmentId special check - optional but should not be empty if present
            if (columns.length === 8 && departmentId.trim() === '') {
                errors.push({
                    line: lineNumber,
                    message: "DepartmentId should not be empty if column is included",
                    row
                });
                return;
            }

            // If we reached here, the row is valid
            validRows++;
        });

        return {
            projectedRows: validRows,
            invalidRows: errors.length,
            errors: errors,
            analyzed: true
        };
    } catch (error) {
        console.error("Error analyzing file:", error);
        return {
            projectedRows: 0,
            invalidRows: 0,
            errors: [],
            analyzed: false
        };
    }
}

// export const UserStatusSchema = z.boolean();