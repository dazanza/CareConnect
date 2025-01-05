import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const path = req.nextUrl.pathname

  // Create Supabase client with response for setting cookies
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Refresh session if expired - this will set the cookie if successful
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session error:', error)
    }

    // Allow all public routes without any auth check
    if (path === '/sign-in' || 
        path === '/sign-up' || 
        path === '/reset-password' || 
        path === '/update-password') {
      
      // If user is signed in and trying to access auth pages, redirect to dashboard
      if (session) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
      }
      
      return res
    }

    // Allow root path for everyone
    if (path === '/') {
      return res
    }

    // For protected routes, check for session
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/sign-in'
      redirectUrl.searchParams.set('redirectedFrom', path)
      return NextResponse.redirect(redirectUrl)
    }

    // Return response with refreshed session cookie
    return res

  } catch (e) {
    // If there's an error, redirect to sign-in
    console.error('Middleware error:', e)
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/sign-in'
    return NextResponse.redirect(redirectUrl)
  }
}

// Ensure middleware runs on auth-related paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}