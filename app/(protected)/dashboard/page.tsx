import { getAllDocuments } from "@/actions/documentActions";
import { DocumentsTable } from "@/components/users/documents-table";
import { checkUserAccess } from "@/actions/roleActions";
import { ErrorDisplay } from "@/components/ui/error-display";
import { fetchData } from "@/lib/error-utils";

export default async function DocumentsPage() {
    const result = await checkUserAccess();
    if (!result.success) {
        return <ErrorDisplay error={result.error.message} />;
    }

    const data = await fetchData({
        documents: getAllDocuments()
    });

    if (!data.success) {
        return <ErrorDisplay error={data.error} />;
    }

    const { documents } = data.data;

    return (
        <DocumentsTable documents={documents} />
    )
}