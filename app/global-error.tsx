'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Optional: Log the error to an error reporting service
        console.error('Global error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong!</h2>
                        <p className="text-gray-600 mb-6">
                            {error.message || 'An unexpected error occurred'}
                        </p>
                        <div className="text-sm text-gray-500 mb-4">
                            {error.digest && <p>Error ID: {error.digest}</p>}
                        </div>
                        <button
                            onClick={() => reset()}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}