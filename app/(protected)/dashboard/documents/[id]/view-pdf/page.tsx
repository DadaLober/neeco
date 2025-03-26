import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDocumentById } from "../page"
import ViewPdfClientPage from "./ViewPdfClientPage"

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

    const document = await getDocumentById(resolvedParams.id);

    if (!document) {
        console.log("Document not found")
        notFound()
    }

    return <ViewPdfClientPage document={document} />
}

