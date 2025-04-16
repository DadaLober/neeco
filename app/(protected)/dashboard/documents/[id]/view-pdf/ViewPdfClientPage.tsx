"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TransformedDocument } from "../page"

const STATUS_STYLES = {
    approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-500"
    },
    pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-500"
    },
    rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-500"
    },
    default: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-500"
    }
}

interface ViewPdfClientPageProps {
    document: TransformedDocument;
    pdfUrl?: string;
    backButtonHref?: string;
    customBackIcon?: React.ReactNode;
    showItemType?: boolean;
    showStatus?: boolean;
    headerClassName?: string;
    iframeClassName?: string;
}

export default function ViewPdfClientPage({
    document,
    pdfUrl = "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf",
    backButtonHref,
    showItemType = true,
    showStatus = true,
    headerClassName = "",
    iframeClassName = ""
}: ViewPdfClientPageProps) {
    const getStatusStyle = (status: string) => {
        const normalizedStatus = status.toLowerCase() as keyof typeof STATUS_STYLES
        const styles = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.default
        return `${styles.bg} ${styles.text} ${styles.border}`
    }

    const defaultBackHref = `/dashboard/documents/${document.id}`

    return (
        <div className="flex flex-col flex-grow">
            {/* Back Button Section - Moved to top right */}
            <div className="flex justify-end p-2">
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                >
                    <Link href={backButtonHref || defaultBackHref}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            </div>

            {/*  Header Section */}
            <div className={`flex items-center justify-center p-4 border-b ${headerClassName}`}>
                {/*  Document Title Section */}
                <div className="text-lg font-semibold">
                    {document.referenceNo}
                    {showItemType && (
                        <span className="text-sm text-gray-500 ml-2">
                            {document.itemType}
                        </span>
                    )}
                    {showStatus && (
                        <span
                            className={`ml-2 px-2 py-1 text-sm font-medium border rounded ${getStatusStyle(document.itemStatus)}`}
                        >
                            {document.itemStatus}
                        </span>
                    )}
                </div>
            </div>

            {/*  PDF Viewer */}
            <div className="flex-grow p-2">
                <iframe
                    src={pdfUrl}
                    className={`w-full h-[calc(100vh-142px)] ${iframeClassName}`}
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