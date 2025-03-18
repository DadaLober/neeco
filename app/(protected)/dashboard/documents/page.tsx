import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllDocuments } from "@/actions/itemActions";
import { DocumentsTable } from "@/components/dashboard/documents-table";

export default async function DocumentsPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const data = await getAllDocuments();

    if ('error' in data) {
        return <div>Error fetching items</div>
    }

    const data2 = [
        {
            id: "1",
            referenceNo: "123456789",
            documentType: "Invoice",
            documentStatus: "approved",
            purpose: "Invoice for XYZ Company",
            supplier: "XYZ Company",
            oic: true,
            date: new Date(),
            departmentId: "1",
            department: {
                id: "1",
                name: "Finance"
            }
        },
        {
            id: "2",
            referenceNo: "123456789",
            documentType: "Invoice",
            documentStatus: "approved",
            purpose: "Invoice for XYZ Company",
            supplier: "XYZ Company",
            oic: true,
            date: new Date(),
            departmentId: "1",
            department: {
                id: "1",
                name: "Finance"
            }
        },
        {
            id: "3",
            referenceNo: "123456789",
            documentType: "Invoice",
            documentStatus: "approved",
            purpose: "Invoice for XYZ Company",
            supplier: "XYZ Company",
            oic: true,
            date: new Date(),
            departmentId: "1",
            department: {
                id: "1",
                name: "Finance"
            }
        },
        {
            id: "4",
            referenceNo: "123456789",
            documentType: "Invoice",
            documentStatus: "approved",
            purpose: "Invoice for XYZ Company",
            supplier: "XYZ Company",
            oic: true,
            date: new Date(),
            departmentId: "1",
            department: {
                id: "1",
                name: "Finance"
            }
        },
        {
            id: "5",
            referenceNo: "123456789",
            documentType: "Invoice",
            documentStatus: "approved",
            purpose: "Invoice for XYZ Company",
            supplier: "XYZ Company",
            oic: true,
            date: new Date(),
            departmentId: "1",
            department: {
                id: "1",
                name: "Finance"
            }
        },]

    const combinedData = [...data, ...data2]

    if ('error' in data) {
        return <div>Error fetching items</div>
    }

    return (
        <div className="flex flex-col">
            <div className="flex">
                <DocumentsTable documents={combinedData} />
            </div>
        </div>
    )
}