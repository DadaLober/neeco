type FooterLinksProps = {
    mode: 'login' | 'register'
}

export function FooterLinks({ mode }: FooterLinksProps) {
    if (mode === 'login') {
        return (
            <>
                <p className="text-center text-sm text-[#008033] mt-4">
                    Don&apos;t have an account?{" "}
                    <a href="/register" className="font-semibold hover:underline text-[#008033]">
                        Sign up
                    </a>
                </p>
                <p className="text-center text-sm text-[#008033] mt-2">
                    <a href="/forgot-password" className="font-semibold hover:underline text-[#008033]">
                        Forgot password?
                    </a>
                </p>
            </>
        )
    }

    return (
        <p className="text-center text-sm text-[#008033] mt-4">
            Already have an account?{" "}
            <a href="/login" className="font-semibold hover:underline text-[#008033]">
                Sign in
            </a>
        </p>
    )
}
