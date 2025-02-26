import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export default async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const session = request.cookies.get('authjs.session-token')
        const twofaEnabled = request.cookies.get('2fa_enabled')
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (twofaEnabled) {
            return NextResponse.redirect(new URL(`verify-otp/?callbackUrl=${encodeURIComponent("/dashboard")}`, request.url))
        }
        return NextResponse.next()
    }

}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
}
