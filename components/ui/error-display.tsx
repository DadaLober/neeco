'use client';

import { Button } from "@/components/ui/button";

export interface ErrorDisplayProps {
    error?: string | Error;
    reset?: () => void;
    title?: string;
}

export function ErrorDisplay({
    error,
    reset,
    title = "Error Loading Data"
}: ErrorDisplayProps) {
    const errorMessage =
        typeof error === "string"
            ? error
            : error instanceof Error
                ? error.message
                : "An unknown error occurred";

    return (
        <div className="rounded-lg border border-red-100 bg-red-50 p-6">
            <h1 className="text-2xl font-bold text-red-800 mb-4">{title}</h1>
            <p className="text-red-600 mb-6">{errorMessage}</p>
            {reset && (
                <Button onClick={reset} variant="destructive">
                    Try Again
                </Button>
            )}
        </div>
    );
}
