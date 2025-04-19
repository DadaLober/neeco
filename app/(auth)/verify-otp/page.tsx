import { TwoFactorVerification } from "@/components/auth/two-factor"
import { checkUserAccess } from "@/actions/roleActions"
import { ErrorDisplay } from "@/components/ui/error-display";

export default async function TwoFactorAuthPage() {
    const result = await checkUserAccess();
    if (!result.success) {
        return <ErrorDisplay error={result.error.message} />;
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <TwoFactorVerification />
            </div>
        </div>
    )
}