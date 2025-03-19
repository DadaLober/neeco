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

    if ('error' in data) {
        return <div>Error fetching items</div>
    }

    return (
        <div className="flex flex-col">
            <div className="flex">
                <DocumentsTable documents={data} />
            </div>
        </div>
    )
}