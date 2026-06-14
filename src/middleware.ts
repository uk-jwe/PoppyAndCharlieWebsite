import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/setup')) {
    return NextResponse.next()
  }
  if (pathname.startsWith('/admin')) {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
