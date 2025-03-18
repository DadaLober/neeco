export type UnauthorizedResponse = { error: string }

export type Documents = {
    id: string;
    referenceNo: string;
    documentType: string;
    documentStatus: string;
    purpose: string;
    supplier: string;
    oic: boolean;
    date: Date;
}