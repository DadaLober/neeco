import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export default async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const session = request.cookies.get('authjs.session-token')
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        return NextResponse.next()
    }

}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
}
