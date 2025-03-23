import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllDocuments } from "@/actions/itemActions";
import { DocumentsTable } from "@/components/users/documents-table";

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
        <DocumentsTable documents={data} />
    )
}