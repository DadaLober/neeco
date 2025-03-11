import type React from "react"
interface DashboardHeaderProps {
    heading: string
    description?: string
    children?: React.ReactNode
}

export function DashboardHeader({ heading, description, children }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {children}
        </div>
    )
}

