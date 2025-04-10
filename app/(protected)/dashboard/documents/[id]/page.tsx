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
import { ApprovalTimeline } from "@/components/users/approval-timeline"
import { prisma as db } from "@/lib/prisma"
import { checkUserRoleAndDept, getSelf } from "@/actions/roleActions"
import { auth } from "@/auth"

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

type CurrentUser = {
    id: string;
    role: string;
    approvalRoleId: number | null;
};

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
            totalApprovalSteps: Array.from(new Set(document.approvalSteps.map(step => step.role.id))).length,
            approvalSteps: document.approvalSteps
        };
    } catch (error) {
        console.error("Error fetching document:", error);
        return null;
    }
}

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> | undefined }) {
    const session = await auth();
    const fullUser = await getSelf(session);

    if (!fullUser) {
        throw new Error("User not found");
    }

    const currentUser: Pick<CurrentUser, 'id' | 'role' | 'approvalRoleId'> = fullUser;
    const resolvedParams = params ? await params : undefined;
    const id = resolvedParams?.id;

    if (!id) {
        notFound();
    }

    const document = await getDocumentById(id);

    if (!document) {
        notFound();
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

    const calculateApprovalProgress = () => {
        // Create a map to track the highest status per role
        const roleStatusMap = new Map<number, string>()

        document.approvalSteps.forEach(step => {
            const roleId = step.role.id
            if (!roleStatusMap.has(roleId)) {
                roleStatusMap.set(roleId, step.status)
            } else {
                const currentStatus = roleStatusMap.get(roleId)
                // Prioritize "approved" > "pending" > "rejected"
                if (
                    currentStatus === "pending" && step.status === "approved" ||
                    currentStatus === "rejected" && step.status === "approved"
                ) {
                    roleStatusMap.set(roleId, "approved")
                }
            }
        })

        const uniqueRoles = roleStatusMap.size
        const approvedRoles = Array.from(roleStatusMap.values()).filter(status => status === "approved").length

        // For rejected, cap progress at rejection point
        if (document.itemStatus.toLowerCase() === "rejected") {
            const rejectionIndex = document.approvalSteps.findIndex(s => s.status === "rejected")
            const rejectedRoleId = document.approvalSteps[rejectionIndex]?.role.id
            const indexInUniqueRoles = Array.from(roleStatusMap.keys()).indexOf(rejectedRoleId)
            return (approvedRoles / (indexInUniqueRoles + 1)) * 100
        }

        return (approvedRoles / uniqueRoles) * 100
    }


    // Determine if the current user can approve/reject
    const canApprove = await checkUserRoleAndDept(document, currentUser);

    return (
        <>
            <div className="flex justify-end p-2">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/documents">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
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
                            <CardTitle>Current Progress</CardTitle>
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
                            </div>
                        </CardContent>
                        {canApprove && (
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