"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransformedDocument } from "../page"

export default function ViewPdfClientPage({ document }: { document: TransformedDocument }) {
    const pdfUrl = "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf"

    // Define status styles
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "bg-green-100 text-green-700 border-green-500"
            case "pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-500"
            case "rejected":
                return "bg-red-100 text-red-700 border-red-500"
            default:
                return "bg-gray-100 text-gray-700 border-gray-500"
        }
    }

    return (
        <div className="flex flex-col flex-grow">

            {/* Header Section */}
            <div className="flex items-center justify-between p-4 border-b bg-white relative">

                {/* Back Button (Left-Aligned) */}
                <div className="absolute left-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/documents/${document.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Document
                        </Link>
                    </Button>
                </div>

                {/* Document Title with Status */}
                <div className="flex-grow flex justify-center items-center">
                    <div className="text-lg font-semibold">
                        {document.referenceNo}
                        <span className="text-sm text-gray-500 ml-2">
                            {document.itemType}
                        </span>
                        <span
                            className={`ml-2 px-2 py-1 text-sm font-medium border rounded ${getStatusStyle(document.itemStatus)}`}
                        >
                            {document.itemStatus}
                        </span>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-grow">
                <iframe
                    src={pdfUrl}
                    className="w-full h-[calc(100vh-126px)]"
                    title={`PDF Viewer - ${document.referenceNo}`}
                    aria-label="Document PDF viewer"
                    role="document"
                    tabIndex={0}
                    allowFullScreen
                />
            </div>
        </div>
    )
}
