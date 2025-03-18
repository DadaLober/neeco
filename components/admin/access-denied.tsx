import { AlertCircle } from "lucide-react"

export default function AccessDeniedPage() {
    return (
        <div className="flex items-center justify-center">
            <div className="max-w-md text-center p-6">
                <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
                <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
                <p className="text-muted-foreground mb-6">
                    You do not have permission to access this page. This area is restricted to administrators only.
                </p>
            </div>
        </div>
    )
}
