import Link from "next/link"
import { notFound } from "next/navigation"
import {
    ArrowLeft,
    Calendar,
    Building2,
    User,
    Package,
    FileText,
    FileIcon,
    CheckCircle,
    XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ApprovalTimeline } from "@/components/users/approval-timeline"
import { prisma as db } from "@/lib/prisma"

export type TransformedDocument = {
    id: string;
    referenceNo: string;
    itemType: string;
    itemStatus: string;
    date: Date | null;
    departmentName: string;
    oic: boolean;
    supplier: string | null;
    purpose: string | null;
    totalApprovalSteps: number;
    approvalSteps: Array<{
        role: {
            id: number;
            name: string;
            sequence: number | null
        };
        user: {
            id: string;
            name: string | null;
            email: string | null;
        } | null;
        status: string;
    }>;
}

export async function getDocumentById(id: string): Promise<TransformedDocument | null> {
    try {
        const document = await db.documents.findUnique({
            where: { id },
            include: {
                department: true,
                approvalSteps: {
                    include: {
                        role: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    },
                    orderBy: {
                        role: {
                            sequence: 'asc'
                        }
                    }
                }
            }
        });

        if (!document) {
            return null;
        }

        // Transform the data to match the expected format
        return {
            id: document.id,
            referenceNo: document.referenceNo,
            itemType: document.documentType,
            itemStatus: document.documentStatus,
            date: document.date,
            departmentName: document.department?.name || "Unknown Department",
            oic: document.oic,
            supplier: document.supplier,
            purpose: document.purpose,
            totalApprovalSteps: document.approvalSteps.length,
            approvalSteps: document.approvalSteps
        };
    } catch (error) {
        console.error("Error fetching document:", error);
        return null;
    }
}

export default async function DocumentPage({
    params
}: {
    params: Promise<{ id: string }> | undefined
}) {
    // Handle both Promise and direct object cases
    const resolvedParams = params ? await params : undefined;
    const id = resolvedParams?.id;

    if (!id) {
        notFound();
    }

    const document = await getDocumentById(id);

    if (!document) {
        notFound();
    }

    const getCurrentApproverStep = () => {
        // Find the first pending step
        return document.approvalSteps.find((step) => step.status === "pending");
    }

    type BadgeVariant = "default" | "destructive" | "outline" | "secondary";

    // Get status badge variant based on status
    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved":
                return "success"
            case "rejected":
                return "destructive"
            case "in progress":
                return "warning"
            default:
                return "secondary"
        }
    }

    // Calculate document approval progress percentage
    const calculateApprovalProgress = () => {
        // Count approved steps
        const approvedSteps = document.approvalSteps.filter((step) => step.status === "approved").length

        // For rejected documents, show progress up to the rejection point
        if (document.itemStatus.toLowerCase() === "rejected") {
            const rejectedStepIndex = document.approvalSteps.findIndex((step) => step.status === "rejected")
            if (rejectedStepIndex !== -1) {
                // Progress is the approved steps as a percentage of steps up to and including the rejected step
                return (approvedSteps / (rejectedStepIndex + 1)) * 100
            }
        }

        // For other statuses, show progress as a percentage of total steps
        return (approvedSteps / document.totalApprovalSteps) * 100
    }

    // Determine if the current user can approve/reject
    // In a real app, this would check the user's role against the current approval step
    const canApproveOrReject = document.itemStatus.toLowerCase() === "pending" || document.itemStatus.toLowerCase() === "in progress"

    return (
        <>
            <div className="flex justify-end p-2">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/documents">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Documents
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{document.referenceNo}</CardTitle>
                                    <CardDescription>{document.itemType}</CardDescription>
                                </div>
                                <Badge variant={getStatusBadgeVariant(document.itemStatus) as BadgeVariant}>{document.itemStatus}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-medium">Document Date</p>
                                            <p className="text-sm text-muted-foreground">{document.date ? new Date(document.date).toLocaleDateString() : "None"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-medium">Department</p>
                                            <p className="text-sm text-muted-foreground">{document.departmentName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-medium">OIC Document</p>
                                            <p className="text-sm text-muted-foreground">{document.oic ? "Yes" : "No"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-medium">Supplier</p>
                                            <p className="text-sm text-muted-foreground">{document.supplier}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="font-medium">Purpose</p>
                                            <p className="text-sm text-muted-foreground">{document.purpose}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/50 flex justify-end gap-3 pt-3 pb-3 px-6 border-t">
                            <Button variant="outline" className="w-auto" asChild>
                                <Link href={`/dashboard/documents/${document.id}/view-pdf`}>
                                    <FileIcon className="mr-2 h-4 w-4" />
                                    View PDF
                                </Link>
                            </Button>
                            {/* <Button variant="outline" className="w-auto" asChild>
                                <Link href={`/documents/${document.id}/edit`}>Edit Document</Link>
                            </Button> */}
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Document Timeline</CardTitle>
                            <CardDescription>Track the approval progress of this document</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ApprovalTimeline steps={document.approvalSteps} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approval Status</CardTitle>
                            <CardDescription>Current progress through approval workflow</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Progress</span>
                                        <span>
                                            {document.approvalSteps.filter((step) => step.status === "approved").length}/
                                            {document.totalApprovalSteps} steps
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${document.itemStatus.toLowerCase() === "rejected" ? "bg-red-500" : "bg-green-500"}`}
                                            style={{ width: `${calculateApprovalProgress()}%` }}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="text-sm font-medium mb-3">Current Approver</h4>
                                    {document.itemStatus.toLowerCase() !== "approved" && document.itemStatus.toLowerCase() !== "rejected" ? (
                                        <div className="bg-muted p-3 rounded-md">
                                            {(() => {
                                                const currentStep = getCurrentApproverStep();
                                                if (currentStep && currentStep.user) {
                                                    return (
                                                        <>
                                                            <p className="font-medium">{currentStep.role.name}</p>
                                                            <p className="text-sm text-primary mt-1">{currentStep.user.name}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">Waiting for approval</p>
                                                        </>
                                                    );
                                                } else if (currentStep) {
                                                    return (
                                                        <>
                                                            <p className="font-medium">{currentStep.role.name}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">No approver assigned</p>
                                                        </>
                                                    );
                                                } else {
                                                    return (
                                                        <p className="font-medium">No pending approvals found</p>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="bg-muted p-3 rounded-md">
                                            <p className="font-medium">
                                                {document.itemStatus.toLowerCase() === "approved" ? "All approvals complete" : "Process halted"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {document.itemStatus.toLowerCase() === "approved"
                                                    ? "Document has been fully approved"
                                                    : "Document requires attention"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        {canApproveOrReject && (
                            <CardFooter className="flex flex-col gap-3 pt-4 border-t">
                                <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                                    <Link href={`/documents/${document.id}/view-pdf`}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Review & Approve
                                    </Link>
                                </Button>
                                <Button variant="destructive" className="w-full" asChild>
                                    <Link href={`/documents/${document.id}/view-pdf`}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Review & Reject
                                    </Link>
                                </Button>
                            </CardFooter>
                        )}
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Document Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full">
                                Download Document
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}