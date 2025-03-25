import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDocumentById } from "../page"
import ViewPdfClientPage from "./ViewPdfClientPage"

export const metadata: Metadata = {
    title: "View Document PDF",
    description: "View the PDF version of this document",
}

export default async function ViewPdfPage({ params }: { params: { id: string } }) {
    const document = await getDocumentById(params.id)

    if (!document) {
        console.log("Document not found")
        notFound()
    }

    return <ViewPdfClientPage document={document} />
}

