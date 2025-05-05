"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { DocumentWithRelations } from "@/actions/queries"

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
    document: DocumentWithRelations;
    pdfUrl?: string;
    onApprove?: (documentId: string) => Promise<void>;
    onReject?: (documentId: string) => Promise<void>;
}

export default function ViewPdfClientPage({
    document,
    pdfUrl = "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf",
    onApprove,
    onReject
}: ViewPdfClientPageProps) {
    const [isLoading, setIsLoading] = useState<{ approve: boolean, reject: boolean }>({ approve: false, reject: false });

    // Confirmation dialogs state
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    const getStatusStyle = (status: string) => {
        const normalizedStatus = status.toLowerCase() as keyof typeof STATUS_STYLES
        const styles = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.default
        return `${styles.bg} ${styles.text} ${styles.border}`
    }

    const defaultBackHref = `/dashboard/${document.id}`

    const handleApproveClick = () => {
        setApproveDialogOpen(true);
    };

    const handleRejectClick = () => {
        setRejectDialogOpen(true);
    };

    const handleApproveConfirm = async () => {
        if (onApprove) {
            setIsLoading({ ...isLoading, approve: true });
            try {
                await onApprove(document.id);
                setApproveDialogOpen(false);
            } catch (error) {
                console.error("Error approving document:", error);
            } finally {
                setIsLoading({ ...isLoading, approve: false });
            }
        }
    };

    const handleRejectConfirm = async () => {
        if (onReject) {
            setIsLoading({ ...isLoading, reject: true });
            try {
                await onReject(document.id);
                setRejectDialogOpen(false);
            } catch (error) {
                console.error("Error rejecting document:", error);
            } finally {
                setIsLoading({ ...isLoading, reject: false });
            }
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-slate-50">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    {/* Left Side: Back Button and Document Title aligned */}
                    <div className="flex items-center space-x-4">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="p-1 h-8 w-8 rounded-full"
                        >
                            <Link href={defaultBackHref} className="flex items-center justify-center">
                                <ArrowLeft className="h-5 w-5" />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>

                        <div className="flex items-center">
                            <h2 className="text-lg font-medium text-gray-800">{document.referenceNo}</h2>
                            {document.documentType && (
                                <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
                                    {document.documentType}
                                </span>
                            )}
                        </div>

                        {document.documentStatus && (
                            <span
                                className={`hidden sm:inline-flex px-2 py-0.5 text-xs font-medium border rounded-full ${getStatusStyle(document.documentStatus)}`}
                            >
                                {document.documentStatus}
                            </span>
                        )}
                    </div>

                    {/* Right Side: Action Buttons */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="font-medium"
                            onClick={handleRejectClick}
                        >
                            <XCircle className="h-4 w-4 mr-1.5" />
                            <span>Reject</span>
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="font-medium"
                            onClick={handleApproveClick}
                        >
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                            <span>Approve</span>
                        </Button>
                    </div>
                </div>

                {/* Mobile Status Display */}
                {document.documentStatus && (
                    <div className="sm:hidden px-4 py-1 bg-gray-50 border-b">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                                {document.documentType}
                            </span>
                            <span
                                className={`px-2 py-0.5 text-xs font-medium border rounded-full ${getStatusStyle(document.documentStatus)}`}
                            >
                                {document.documentStatus}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* PDF Viewer */}
            <div className="flex-grow w-full bg-white">
                <div className="h-full w-full p-0 sm:p-2 lg:p-4">
                    <div className="w-full h-full rounded-md overflow-hidden shadow-md">
                        <iframe
                            src={pdfUrl}
                            className={`w-full h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)]`}
                            title={`PDF Viewer - ${document.referenceNo}`}
                            aria-label="Document PDF viewer"
                            role="document"
                            tabIndex={0}
                            allowFullScreen
                        />
                    </div>
                </div>
            </div>

            {/* Approve Confirmation Dialog */}
            <ConfirmationDialog
                open={approveDialogOpen}
                onOpenChange={setApproveDialogOpen}
                title="Confirm Approval"
                description={<>Are you sure you want to approve document <strong>{document.referenceNo}</strong>?</>}
                confirmLabel="Approve"
                confirmVariant="default"
                onConfirm={handleApproveConfirm}
                isLoading={isLoading.approve}
            />

            {/* Reject Confirmation Dialog */}
            <ConfirmationDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                title="Confirm Rejection"
                description={<>Are you sure you want to reject document <strong>{document.referenceNo}</strong>? This action cannot be undone.</>}
                confirmLabel="Reject"
                confirmVariant="destructive"
                onConfirm={handleRejectConfirm}
                isLoading={isLoading.reject}
            />
        </div>
    )
}