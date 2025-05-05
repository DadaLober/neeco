import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDocumentById } from "@/actions/documentActions"
import ViewPdfClientPage from "./ViewPdfClientPage"
import { ErrorDisplay } from "@/components/ui/error-display"

export const metadata: Metadata = {
    title: "View Document PDF",
    description: "View the PDF version of this document",
}

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> | undefined }) {
    const resolvedParams = params ? await params : undefined;
    const id = resolvedParams?.id;

    if (!id) {
        notFound();
    }

    const result = await getDocumentById(resolvedParams.id);

    if (!result.success) {
        return <ErrorDisplay error={result.error.message} />;
    }

    if (!result.data) {
        notFound();
    }

    return <ViewPdfClientPage document={result.data} />
}