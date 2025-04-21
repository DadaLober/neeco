'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Copy, CheckCircle } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        //Log the error to an error reporting service
        console.error('Global error:', error);
    }, [error]);

    const copyErrorDetails = () => {
        const errorDetails = `
Error: ${error.message || 'Unknown error'}
${error.digest ? `Error ID: ${error.digest}` : ''}
Stack: ${error.stack || 'No stack trace available'}
        `.trim();

        navigator.clipboard.writeText(errorDetails).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const goHome = () => {
        window.location.href = '/';
    };

    return (
        <html lang="en">
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-red-50 p-6 flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-8 w-8 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">We&apos;re sorry, but something went wrong.</h2>
                                <p className="mt-2 text-gray-600">
                                    {error.message || 'An unexpected error occurred. Our team has been notified.'}
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            {error.digest && (
                                <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg text-sm">
                                    <span className="text-gray-600">Error ID: {error.digest}</span>
                                    <button
                                        onClick={copyErrorDetails}
                                        className="flex items-center text-blue-600 hover:text-blue-800"
                                        aria-label="Copy error details"
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                <span>Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-1" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={goHome}
                                    className="flex-1 py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to home
                                </button>
                                <button
                                    onClick={() => reset()}
                                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try again
                                </button>
                            </div>

                            {error.stack && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        {showDetails ? (
                                            <ChevronUp className="h-4 w-4 mr-1" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 mr-1" />
                                        )}
                                        {showDetails ? 'Hide technical details' : 'Show technical details'}
                                    </button>

                                    {showDetails && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg overflow-auto max-h-60">
                                            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                                {error.stack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}