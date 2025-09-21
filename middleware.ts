import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Temporarily disable protection to test routing
  // TODO: Re-enable after fixing Clerk authentication
  console.log('Middleware called for:', req.url)
  
  // Add try-catch to handle authentication errors gracefully
  try {
    if (isProtectedRoute(req)) {
      // Temporarily comment out protection to test dashboard access
      // await auth.protect()
      console.log('Protected route accessed:', req.url)
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    // Allow the request to continue to avoid infinite loops
    return new Response(null, { status: 200 })
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}