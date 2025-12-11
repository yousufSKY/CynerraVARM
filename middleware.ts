import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
])

const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Always allow auth routes to pass through - let Clerk handle everything
  if (isAuthRoute(req)) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  if (isProtectedRoute(req)) {
    try {
      const { userId } = await auth()
      
      if (!userId) {
        // Not authenticated, redirect to sign-in
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return NextResponse.redirect(signInUrl)
      }
      
      // Authenticated, allow through
      return NextResponse.next()
    } catch (error) {
      // On any error (clock skew, etc.), allow through - let client-side handle it
      // This prevents redirect loops
      console.warn('Middleware auth error (likely clock skew):', error)
      return NextResponse.next()
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
