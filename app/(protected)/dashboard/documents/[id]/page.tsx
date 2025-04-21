import Link from "next/link";
import { notFound } from "next/navigation";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApprovalTimeline } from "@/components/users/approval-timeline";
import { checkUserAccess, checkUserRoleAndDept, getSelf } from "@/actions/roleActions";
import { getDocumentById } from "@/actions/documentActions";
import { ErrorDisplay } from "@/components/ui/error-display";
import { DocumentWithRelations } from "@/actions/queries";

type BadgeVariant = "default" | "destructive" | "outline" | "secondary" | "success" | "warning";
type CurrentUser = {
    id: string;
    role: string;
    approvalRoleId: number | null;
};

// Utility functions
function getStatusBadgeVariant(status: string): BadgeVariant {
    const statusMap: Record<string, BadgeVariant> = {
        approved: "success",
        rejected: "destructive",
        "in progress": "warning",
    };
    return statusMap[status.toLowerCase()] || "secondary";
}

function DocumentInfoItem({
    icon,
    title,
    value
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
}) {
    return (
        <div className="flex items-start space-x-3">
            <span className="h-5 w-5 text-muted-foreground mt-0.5">{icon}</span>
            <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{value}</p>
            </div>
        </div>
    );
}

function calculateApprovalProgress(document: DocumentWithRelations): number {
    const roleStatusMap = new Map<number, string>();

    document.approvalSteps.forEach((step) => {
        const roleId = step.role.id;
        const currentStatus = roleStatusMap.get(roleId);

        if (!currentStatus ||
            (currentStatus === "pending" && step.status === "approved") ||
            (currentStatus === "rejected" && step.status === "approved")) {
            roleStatusMap.set(roleId, step.status);
        }
    });

    const uniqueRoles = roleStatusMap.size;
    const approvedRoles = Array.from(roleStatusMap.values()).filter(status => status === "approved").length;

    // Handle rejected documents
    if (document.documentStatus.toLowerCase() === "rejected") {
        const rejectionIndex = document.approvalSteps.findIndex((s) => s.status === "rejected");
        if (rejectionIndex >= 0) {
            const rejectedRoleId = document.approvalSteps[rejectionIndex]?.role.id;
            const indexInUniqueRoles = Array.from(roleStatusMap.keys()).indexOf(rejectedRoleId);
            return (approvedRoles / (indexInUniqueRoles + 1)) * 100;
        }
    }

    return uniqueRoles ? (approvedRoles / uniqueRoles) * 100 : 0;
}

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> | undefined }) {
    if (!params) {
        notFound();
    }

    const [userResult, selfResult, documentResult] = await Promise.all([
        checkUserAccess(),
        getSelf(),
        getDocumentById((await params).id)
    ]);

    if (!userResult.success) return <ErrorDisplay error={userResult.error.message} />;
    if (!selfResult.success) return <ErrorDisplay error={selfResult.error.message} />;
    if (!documentResult.success) return <ErrorDisplay error={documentResult.error.message} />;
    if (!selfResult.data) return <ErrorDisplay error="User not found" />;

    const document = documentResult.data;
    if (!document) notFound();

    const currentUser: CurrentUser = {
        id: userResult.data.user.id,
        role: userResult.data.user.role,
        approvalRoleId: selfResult.data.approvalRoleId
    };

    const canApprove = await checkUserRoleAndDept(document, currentUser);
    const totalApprovalSteps = new Set(document.approvalSteps.map((step) => step.role.id)).size;
    const progressPercentage = calculateApprovalProgress(document);

    return (
        <div className="space-y-4 p-2">
            <div className="flex justify-end">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/documents">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main content column */}
                <div className="md:col-span-2 space-y-6">
                    <DocumentInfoCard document={document} />
                    <ApprovalTimelineCard document={document} />
                </div>

                {/* Sidebar column */}
                <div className="space-y-6">
                    <ProgressCard
                        document={document}
                        progressPercentage={progressPercentage}
                        totalApprovalSteps={totalApprovalSteps}
                        canApprove={canApprove}
                    />
                    <ActionsCard />
                </div>
            </div>
        </div>
    );
}

function DocumentInfoCard({ document }: { document: DocumentWithRelations }) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>{document.referenceNo}</CardTitle>
                        <CardDescription>{document.documentType}</CardDescription>
                    </div>
                    <Badge variant={getStatusBadgeVariant(document.documentStatus)}>
                        {document.documentStatus}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <DocumentInfoItem
                            icon={<Calendar />}
                            title="Document Date"
                            value={document.date ? new Date(document.date).toLocaleDateString() : "None"}
                        />
                        <DocumentInfoItem
                            icon={<Building2 />}
                            title="Department"
                            value={document.department?.name || "Unknown Department"}
                        />
                        <DocumentInfoItem
                            icon={<User />}
                            title="OIC Document"
                            value={document.oic ? "Yes" : "No"}
                        />
                    </div>
                    <div className="space-y-4">
                        <DocumentInfoItem
                            icon={<Package />}
                            title="Supplier"
                            value={document.supplier}
                        />
                        <DocumentInfoItem
                            icon={<FileText />}
                            title="Purpose"
                            value={document.purpose}
                        />
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
    );
}

function ApprovalTimelineCard({ document }: { document: DocumentWithRelations }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Document Timeline</CardTitle>
                <CardDescription>Track the approval progress of this document</CardDescription>
            </CardHeader>
            <CardContent>
                <ApprovalTimeline steps={document.approvalSteps} />
            </CardContent>
        </Card>
    );
}

function ProgressCard({
    document,
    progressPercentage,
    totalApprovalSteps,
    canApprove
}: {
    document: DocumentWithRelations,
    progressPercentage: number,
    totalApprovalSteps: number,
    canApprove: boolean
}) {
    const approvedSteps = document.approvalSteps.filter((step) => step.status === "approved").length;
    const isRejected = document.documentStatus.toLowerCase() === "rejected";

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{approvedSteps}/{totalApprovalSteps} steps</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full ${isRejected ? "bg-red-500" : "bg-green-500"}`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
            {canApprove && (
                <CardFooter className="flex flex-col gap-3 pt-4 border-t">
                    <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                        <Link href={`/dashboard/documents/${document.id}/view-pdf`}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Review & Approve
                        </Link>
                    </Button>
                    <Button variant="destructive" className="w-full" asChild>
                        <Link href={`/dashboard/documents/${document.id}/view-pdf`}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Review & Reject
                        </Link>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

function ActionsCard() {
    return (
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
    );
}