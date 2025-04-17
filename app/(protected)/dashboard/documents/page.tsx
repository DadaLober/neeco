import { auth } from "@/auth";
import { getAllDocuments } from "@/actions/itemActions";
import { DocumentsTable } from "@/components/users/documents-table";
import { isAdmin } from "@/actions/roleActions";
import AccessDeniedPage from "@/components/admin/access-denied";
import { ErrorDisplay } from "@/components/ui/error-display";
import { fetchData } from "@/lib/error-utils";

export default async function DocumentsPage() {
    const session = await auth();
    if (!(await isAdmin(session) || !session)) {
        return <AccessDeniedPage />
    }

    const result = await fetchData({
        documents: getAllDocuments()
    });

    if (!result.success) {
        return <ErrorDisplay error={result.error} />;
    }

    const { documents } = result.data;

    return (
        <DocumentsTable documents={documents} />
    )
}