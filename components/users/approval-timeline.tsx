"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Clock, Calendar, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApprovalStep {
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
    const [selectedUsers, setSelectedUsers] = useState<Record<number, string>>({})

    const stepsByRole: Record<number, ApprovalStep[]> = {}
    steps.forEach(step => {
        if (!stepsByRole[step.role.id]) {
            stepsByRole[step.role.id] = []
        }
        stepsByRole[step.role.id].push(step)
    })

    const sortedRoleIds = Object.keys(stepsByRole).sort((a, b) => {
        const sequenceA = stepsByRole[Number(a)][0].role.sequence ?? 0
        const sequenceB = stepsByRole[Number(b)][0].role.sequence ?? 0
        return sequenceA - sequenceB
    })

    const flatSteps = sortedRoleIds.flatMap(roleId => stepsByRole[Number(roleId)])

    const signableIndex = flatSteps.findIndex(step =>
        step.status === "pending" &&
        flatSteps.slice(0, flatSteps.indexOf(step)).every(prev => prev.status === "approved")
    )

    const isSignable = (step: ApprovalStep) => {
        return flatSteps[signableIndex]?.role.id === step.role.id
    }

    const formatDate = (date: Date | null) => {
        if (!date) return ""
        const dateObj = new Date(date)
        return dateObj.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        })
    }

    const handleUserSelect = (roleId: number, userId: string) => {
        setSelectedUsers(prev => ({
            ...prev,
            [roleId]: userId
        }))
    }

    return (
        <div className="space-y-4">
            <ol className="relative border-l border-muted ml-3">
                {sortedRoleIds.map((roleIdString, index) => {
                    const roleId = Number(roleIdString)
                    const stepsForRole = stepsByRole[roleId]
                    const roleName = stepsForRole[0].role.name
                    const hasMultipleUsers = stepsForRole.length > 1

                    let activeStep = stepsForRole[0]
                    if (hasMultipleUsers && selectedUsers[roleId]) {
                        const selected = stepsForRole.find(s => s.user?.id === selectedUsers[roleId])
                        if (selected) {
                            activeStep = selected
                        }
                    }

                    const signable = isSignable(activeStep)

                    return (
                        <li key={roleId} className={cn("mb-6 ml-6", index === sortedRoleIds.length - 1 && "mb-0")}>
                            <span
                                className={cn(
                                    "absolute flex items-center justify-center w-6 h-6 rounded-full -left-3",
                                    activeStep.status === "approved"
                                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                                        : activeStep.status === "rejected"
                                            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                                )}
                            >
                                {activeStep.status === "approved" ? (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                ) : activeStep.status === "rejected" ? (
                                    <XCircle className="w-3.5 h-3.5" />
                                ) : (
                                    <Clock className="w-3.5 h-3.5" />
                                )}
                            </span>
                            <h3 className="flex items-center mb-1 text-md font-semibold">
                                {roleName}
                                <span
                                    className={cn(
                                        "ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full",
                                        activeStep.status === "approved"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                            : activeStep.status === "rejected"
                                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
                                    )}
                                >
                                    {activeStep.status.charAt(0).toUpperCase() + activeStep.status.slice(1)}
                                </span>
                            </h3>

                            <time className="flex items-center mb-2 text-xs font-normal text-muted-foreground">
                                {activeStep.approvedAt ? (
                                    <>
                                        <Calendar className="mr-1 h-3 w-3" />
                                        {formatDate(activeStep.approvedAt)}
                                    </>
                                ) : (
                                    <>
                                        <Clock className="mr-1 h-3 w-3" />
                                        {activeStep.status === "pending" ? "Awaiting approval" : "Not applicable"}
                                    </>
                                )}
                            </time>

                            {hasMultipleUsers ? (
                                <div className="mb-2">
                                    <div className="text-sm font-medium mb-1">Assignee:</div>
                                    <div className="relative inline-block">
                                        <button
                                            className="flex items-center justify-between w-64 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-md"
                                            onClick={(e) => {
                                                e.currentTarget.nextElementSibling?.classList.toggle('hidden')
                                            }}
                                        >
                                            <span>
                                                {activeStep.user?.name || "Select user"}
                                                {signable && (
                                                    <span className="ml-2 text-xs text-green-600 font-semibold">(Can Sign)</span>
                                                )}
                                            </span>
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </button>
                                        <div className="absolute z-10 hidden w-64 mt-1 bg-white dark:bg-slate-800 rounded-md shadow-lg">
                                            <ul className="py-1">
                                                {stepsForRole.map(step => (
                                                    <li
                                                        key={`${roleId}-${step.userId}`}
                                                        className="px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                                        onClick={() => {
                                                            handleUserSelect(roleId, step.user?.id || "")
                                                            document.querySelectorAll('.absolute.z-10').forEach(el =>
                                                                el.classList.add('hidden')
                                                            )
                                                        }}
                                                    >
                                                        {step.user?.name || "Unassigned"}
                                                        {isSignable(step) && (
                                                            <span className="ml-2 text-xs text-green-600 font-semibold">(Can Sign)</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : activeStep.user ? (
                                <p className="mb-2 text-sm font-medium">
                                    Assignee: <span className="text-muted-foreground">{activeStep.user.name}</span>
                                    {signable && (
                                        <span className="ml-2 text-xs text-green-600 font-semibold">(Can Sign)</span>
                                    )}
                                </p>
                            ) : null}
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}
