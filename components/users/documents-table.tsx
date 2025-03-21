"use client"

import { CardTable } from "@/components/ui/card-table";
import { Department, Documents } from "@prisma/client";
import { useRouter } from "next/navigation";

type DocumentsWithDepartment = Partial<Documents> & { department?: Department | null };

type DocumentsTableProps = {
    documents: DocumentsWithDepartment[]
};

export function DocumentsTable({ documents }: DocumentsTableProps) {
    const router = useRouter();
    return (
        <CardTable
            data={documents}
            columns={[
                {
                    header: "Ref No",
                    accessorKey: "referenceNo",
                    cell: (doc) => <div className="font-medium">{doc.referenceNo}</div>,
                },
                {
                    header: "Type",
                    accessorKey: "documentType",
                    filterable: true,
                    filterAccessor: "documentType",
                },
                {
                    header: "Status",
                    accessorKey: "documentStatus",
                    filterable: true,
                    filterAccessor: "documentStatus",
                    cell: (doc) => (
                        <span
                            className={`px-2 py-1 rounded-full text-sm font-medium ${doc.documentStatus === "approved"
                                ? "bg-green-100 text-green-700"
                                : doc.documentStatus === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                        >
                            {doc.documentStatus}
                        </span>
                    ),
                },
                {
                    header: "Purpose",
                    accessorKey: "purpose",
                    cell: (doc) => (
                        <div className="text-sm text-muted-foreground">{doc.purpose}</div>
                    ),
                },
                {
                    header: "Supplier",
                    accessorKey: "supplier",
                },
                {
                    header: "OIC",
                    accessorKey: "oic",
                    cell: (doc) => (
                        <div
                            className={`text-sm font-medium ${doc.oic ? "text-green-600" : "text-gray-500"
                                }`}
                        >
                            {doc.oic ? "Yes" : "No"}
                        </div>
                    ),
                },
                {
                    header: "Date",
                    accessorKey: "date",
                    sortable: true,
                    cell: (doc) => (
                        <div>
                            {doc.date ? new Date(doc.date).toLocaleDateString() : "None"}
                        </div>
                    ),
                },
                {
                    header: "Department",
                    accessorKey: "department",
                    filterAccessor: "department.name",
                    filterable: true,
                    cell: (doc) => (
                        <div>
                            {doc.department ? doc.department.name : "None"}
                        </div>
                    ),
                },
            ]}
            title="Documents"
            description="A list of all documents in your system."
            searchable
            searchPlaceholder="Search documents..."
            rowActions={[
                {
                    label: "View",
                    onClick: (doc) => {
                        router.push(`documents/${doc.id}`);
                    },
                },
                {
                    label: "Edit",
                    onClick: (doc) => {
                        alert({
                            title: "Edit Document",
                            description: `Editing document: ${doc.referenceNo}`,
                        });
                    },
                },
                {
                    label: "Delete",
                    onClick: (doc) => {
                        alert({
                            title: "Delete Document",
                            description: `Deleting document: ${doc.referenceNo}`,
                            variant: "destructive",
                        });
                    },
                },
            ]}
        />
    );
}
