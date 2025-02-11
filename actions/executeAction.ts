import { isRedirectError } from "next/dist/client/components/redirect-error";

type Options<T> = {
    actionFn: () => Promise<T>;
    successMessage?: string;
};

const executeAction = async <T>({
    actionFn,
    successMessage = "The actions was successful",
}: Options<T>): Promise<{ success: boolean; message: string }> => {
    try {
        await actionFn();
        return {
            success: true,
            message: successMessage,
        };
    } catch (error: any) {
        if (isRedirectError(error)) {
            throw error;
        }

        if (error?.name === 'CallbackRouteError') {
            return {
                success: false,
                message: "Invalid email or password",
            };
        }

        const errorMessage = error instanceof Error ? error.message : "An error has occurred during executing the action";
        return {
            success: false,
            message: errorMessage,
        };
    }
};

export { executeAction };
