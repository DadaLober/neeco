"use client"

import { CheckCircle, XCircle, Clock, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApprovalStep {
    id?: string
    documentId?: string
    userId?: string | null
    status: string
    approvedAt?: Date | null
    role: {
        id: number
        name: string
        sequence: number | null
    }
    user?: {
        id: string
        name: string | null
        email: string | null
    } | null
}

interface ApprovalTimelineProps {
    steps: ApprovalStep[]
}

export function ApprovalTimeline({ steps }: ApprovalTimelineProps) {
    // Sort steps by the sequence from the role property
    const sortedSteps = [...steps].sort((a, b) => (a.role.sequence ?? 0) - (b.role.sequence ?? 0))

    // Format date function
    const formatDate = (date: Date | null) => {
        if (!date) return "";
        const dateObj = new Date(date);
        return dateObj.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    return (
        <div className="space-y-4">
            <ol className="relative border-l border-muted ml-3">
                {sortedSteps.map((step, index) => (
                    <li key={step.role.id} className={cn("mb-6 ml-6", index === sortedSteps.length - 1 && "mb-0")}>
                        <span
                            className={cn(
                                "absolute flex items-center justify-center w-6 h-6 rounded-full -left-3",
                                step.status === "approved"
                                    ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                                    : step.status === "rejected"
                                        ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                            )}
                        >
                            {step.status === "approved" ? (
                                <CheckCircle className="w-3.5 h-3.5" />
                            ) : step.status === "rejected" ? (
                                <XCircle className="w-3.5 h-3.5" />
                            ) : (
                                <Clock className="w-3.5 h-3.5" />
                            )}
                        </span>
                        <h3 className="flex items-center mb-1 text-md font-semibold">
                            {step.role.name}
                            <span
                                className={cn(
                                    "ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full",
                                    step.status === "approved"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                        : step.status === "rejected"
                                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                            : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
                                )}
                            >
                                {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                            </span>
                        </h3>

                        <time className="flex items-center mb-2 text-xs font-normal text-muted-foreground">
                            {step.approvedAt ? (
                                <>
                                    <Calendar className="mr-1 h-3 w-3" />
                                    {formatDate(step.approvedAt)}
                                </>
                            ) : (
                                <>
                                    <Clock className="mr-1 h-3 w-3" />
                                    {step.status === "pending" ? "Awaiting approval" : "Not applicable"}
                                </>
                            )}
                        </time>

                        {/* Display assignee information */}
                        {step.user && (
                            <p className="mb-2 text-sm font-medium">
                                Assignee: <span className="text-muted-foreground">{step.user.name}</span>
                            </p>
                        )}

                        <p className="text-sm font-normal text-muted-foreground">
                            {step.status === "approved"
                                ? "This step has been approved in the workflow."
                                : step.status === "rejected"
                                    ? "This step was rejected. Document cannot proceed further."
                                    : "This step is waiting for approval."}
                        </p>
                    </li>
                ))}
            </ol>
        </div>
    )
}