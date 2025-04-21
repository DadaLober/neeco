'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp, Copy, CheckCircle } from "lucide-react";

interface ErrorDisplayProps {
    error?: string | Error | null;
    reset?: (() => void) | null;
    title?: string;
    subtitle?: string;
    variant?: 'destructive' | 'warning' | 'outline';
}

export function ErrorDisplay({
    error,
    reset = null,
    title = "Error Loading Data",
    subtitle = "Something went wrong",
    variant = 'destructive',
}: ErrorDisplayProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!error) return null;

    const errorMessage = typeof error === "string"
        ? error
        : error instanceof Error
            ? error.message
            : "An unknown error occurred";

    const errorStack = error instanceof Error ? error.stack : null;

    const copyErrorDetails = () => {
        const details = `Error: ${errorMessage}\n${errorStack ? `Stack Trace:\n${errorStack}` : ''}`.trim();
        navigator.clipboard.writeText(details).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleReset = () => {
        if (reset) reset();
    };

    const variants = {
        destructive: {
            container: "border-red-100 bg-red-50",
            title: "text-red-800",
            message: "text-red-600",
            details: "bg-red-100/50",
            icon: "text-red-500"
        },
        warning: {
            container: "border-amber-100 bg-amber-50",
            title: "text-amber-800",
            message: "text-amber-600",
            details: "bg-amber-100/50",
            icon: "text-amber-500"
        },
        outline: {
            container: "border-gray-200 bg-white",
            title: "text-gray-800",
            message: "text-gray-600",
            details: "bg-gray-100/50",
            icon: "text-gray-500"
        }
    };

    const style = variants[variant];

    return (
        <div className="max-w-lg mx-auto w-full">
            <div className={`rounded-lg border p-5 shadow-sm ${style.container}`}>
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                        <AlertCircle className={`h-5 w-5 ${style.icon}`} />
                    </div>
                    <div className="flex-1">
                        <h2 className={`text-lg font-semibold ${style.title}`}>{title}</h2>
                        {subtitle && <p className="text-sm mt-1 mb-2 text-gray-500">{subtitle}</p>}
                        <p className={`text-sm mt-2 ${style.message}`}>{errorMessage}</p>

                        {errorStack && (
                            <div className="mt-4">
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="flex items-center text-xs text-gray-500 hover:text-gray-700"
                                >
                                    {showDetails ? (
                                        <ChevronUp className="h-3 w-3 mr-1" />
                                    ) : (
                                        <ChevronDown className="h-3 w-3 mr-1" />
                                    )}
                                    {showDetails ? 'Hide details' : 'Show details'}
                                </button>

                                {showDetails && (
                                    <div className={`mt-2 p-3 rounded-md overflow-auto max-h-40 text-xs ${style.details}`}>
                                        <pre className="whitespace-pre-wrap font-mono break-all">
                                            {errorStack}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-3">
                            {reset && (
                                <Button
                                    onClick={handleReset}
                                    variant={variant === 'destructive' ? 'destructive' : 'default'}
                                    size="sm"
                                    className="flex items-center"
                                >
                                    <RefreshCw className="h-3 w-3 mr-2" />
                                    Try Again
                                </Button>
                            )}

                            {errorStack && (
                                <Button
                                    onClick={copyErrorDetails}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="h-3 w-3 mr-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3 mr-2" />
                                            Copy Details
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}