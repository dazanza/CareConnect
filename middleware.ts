import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname
  console.log('Current path:', path)

  // Allow all paths in the public route group
  if (path === '/' || path === '/sign-in' || path === '/sign-up') {
    console.log('Public route accessed:', path)
    return res
  }

  // If there is no session and trying to access a non-public route,
  // redirect to the sign-in page
  if (!session) {
    console.log('No session, redirecting to sign-in')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/sign-in'
    redirectUrl.searchParams.set('redirectedFrom', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If there is a session and trying to access auth pages,
  // redirect to the patients page
  if (session && (path === '/sign-in' || path === '/sign-up')) {
    console.log('Session exists, redirecting to patients')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/patients'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}