export type ActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

export function isSuccess<T>(result: ActionResult<T>): result is { success: true; data: T } {
    return result.success;
}

export async function handleAsyncError<T>(promise: Promise<T>): Promise<ActionResult<T>> {
    try {
        const data = await promise;
        return { success: true, data };
    } catch (error) {
        console.error("Error:", error);
        return {
            success: false,
            error: getErrorMessage(error),
        };
    }
}

export async function fetchData<T extends Record<string, Promise<unknown>>>(
    promises: T
): Promise<ActionResult<{ [K in keyof T]: Awaited<T[K]> }>> {
    try {
        const entries = Object.entries(promises);
        const results = await Promise.all(
            entries.map(([key, promise]) =>
                promise.then(value => [key, value] as const)
            )
        );

        const data = results.reduce((acc, [key, value]) => {
            acc[key as keyof T] = value as Awaited<T[keyof T]>;
            return acc;
        }, {} as { [K in keyof T]: Awaited<T[K]> });

        return { success: true, data };
    } catch (error) {
        return { success: false, error: getErrorMessage(error) };
    }
}

function getErrorMessage(error: unknown): string {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    return "An unknown error occurred";
}
