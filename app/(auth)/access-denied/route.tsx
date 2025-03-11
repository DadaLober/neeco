import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function AccessDeniedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="max-w-md text-center">
                <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
                <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
                <p className="text-muted-foreground mb-6">
                    You do not have permission to access this page. This area is restricted to administrators only.
                </p>
                <Button asChild>
                    <Link href="/">Return to Home</Link>
                </Button>
            </div>
        </div>
    )
}

