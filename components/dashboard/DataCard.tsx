"use client"

import type React from "react"
import { useState } from "react"
import {
    CalendarIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClipboardIcon,
    FileTextIcon,
    PackageIcon,
    ThumbsDownIcon,
    XIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface DataCardProps {
    id: string | number
    referenceNo: string
    itemType: string
    itemStatus: string
    purpose: string
    supplier: string
    oic: boolean
    date: string | Date
}

export default function DataCard({
    id,
    referenceNo,
    itemType,
    itemStatus,
    purpose,
    supplier,
    oic,
    date,
}: DataCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending")

    // Format date if it's a Date object
    const formattedDate = date instanceof Date ? date.toLocaleDateString() : typeof date === "string" ? date : "N/A"

    // Function to handle PDF viewing
    const handleViewPdf = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent card from toggling when clicking the button
        setIsDialogOpen(true)
    }

    // Function to handle document approval
    const handleApprove = () => {
        setApprovalStatus("approved")
        // Here you would typically make an API call to update the approval status
        setIsDialogOpen(false)
    }

    // Function to handle document rejection
    const handleReject = () => {
        setApprovalStatus("rejected")
        // Here you would typically make an API call to update the rejection status
        setIsDialogOpen(false)
    }

    return (
        <>
            <Card
                className={cn(
                    "w-full overflow-hidden transition-all duration-200",
                    isExpanded ? "shadow-md" : "shadow-sm hover:shadow-md",
                )}
            >
                <CardHeader
                    className="bg-muted/50 pb-2 cursor-pointer active:bg-muted touch-manipulation"
                    onClick={() => setIsExpanded(!isExpanded)}
                    role="button"
                    aria-expanded={isExpanded}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            setIsExpanded(!isExpanded)
                        }
                    }}
                >
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <ClipboardIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            <span className="truncate">#{referenceNo}</span>
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge
                                variant={itemStatus === "Pending" ? "default" : "outline"}
                                className="text-xs"
                            >
                                {itemStatus}
                            </Badge>
                            {/* Approval status badge */}
                            {approvalStatus !== "pending" && (
                                <Badge variant={approvalStatus === "approved" ? "default" : "destructive"} className="text-xs flex-shrink-0">
                                    {approvalStatus === "approved" ? "Approved" : "Rejected"}
                                </Badge>
                            )}
                            {isExpanded ? (
                                <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    {/* Always visible summary */}
                    <div className="mt-2 text-xs sm:text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                        <div className="flex items-center gap-1">
                            <span className="truncate">{itemType}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </CardHeader>

                {/* Expandable content */}
                <div
                    className={cn(
                        "grid grid-rows-[0fr] transition-all duration-300 ease-in-out",
                        isExpanded && "grid-rows-[1fr]",
                    )}
                >
                    <div className="overflow-hidden">
                        <CardContent className="pt-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Item Type</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-sm sm:text-base">{itemType}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Purpose</p>
                                        <p className="text-sm sm:text-base">{purpose}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Supplier</p>
                                        <p className="text-sm sm:text-base">{supplier}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">OIC</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-sm sm:text-base">{oic ? "True" : "False"}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Date</p>
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                            <p className="text-sm sm:text-base">{formattedDate}</p>
                                        </div>
                                    </div>

                                    {/* Document Status */}
                                    {approvalStatus !== "pending" && (
                                        <div>
                                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Document Status</p>
                                            <div className="flex items-center gap-2">
                                                {approvalStatus === "approved" ? (
                                                    <>
                                                        <CheckIcon className="h-4 w-4 text-green-500" />
                                                        <p className="text-sm sm:text-base text-green-600">Approved</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XIcon className="h-4 w-4 text-red-500" />
                                                        <p className="text-sm sm:text-base text-red-600">Rejected</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* PDF Button */}
                                    <div className="pt-2">
                                        <Button variant="outline" className="w-full sm:w-auto gap-2 h-9" onClick={handleViewPdf}>
                                            <FileTextIcon className="h-4 w-4" />
                                            <span>{approvalStatus === "pending" ? "Review Document" : "View Document"}</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </div>
            </Card>

            {/* Document Viewer Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] w-[95vw] max-h-[95vh] p-0 overflow-hidden">
                    <div className="p-4 sm:p-6 pb-0">
                        <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">Document #{referenceNo}</DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm">
                                {approvalStatus === "pending" ? "Review the document and approve or reject it." : "Document details"}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    {/* PDF Viewer */}
                    <div className="flex-1 h-[50vh] sm:h-[65vh] w-full overflow-hidden">
                        <iframe
                            src={`https://docs.google.com/gview?url=${encodeURIComponent('https://documentcloud.adobe.com/view-sdk-demo/PDFs/Bodea%20Brochure.pdf')}&embedded=true`}
                            className="w-full h-[80vh] border-0"
                            title={`Document for ${referenceNo}`}
                            allowFullScreen
                        />
                    </div>

                    {approvalStatus === "pending" ? (
                        <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t bg-muted/30">
                            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="order-3 sm:order-1 sm:mr-auto w-full sm:w-auto mt-2 sm:mt-0"
                                >
                                    Cancel
                                </Button>
                                <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                                    <Button
                                        variant="destructive"
                                        onClick={handleReject}
                                        className="gap-2 flex-1 sm:flex-auto justify-center"
                                    >
                                        <ThumbsDownIcon className="h-4 w-4" />
                                        <span>Reject</span>
                                    </Button>
                                    <Button onClick={handleApprove} className="gap-2 flex-1 sm:flex-auto justify-center">
                                        <CheckIcon className="h-4 w-4" />
                                        <span>Approve</span>
                                    </Button>
                                </div>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6 pt-3 sm:pt-4 border-t bg-muted/30">
                            <DialogFooter>
                                <Button onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                                    Close
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

