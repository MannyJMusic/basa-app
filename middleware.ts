import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Debug logging
  console.log(`[Middleware] ${nextUrl.pathname} - isLoggedIn: ${isLoggedIn}`)
  console.log(`[Middleware] User:`, req.auth?.user)

  // Skip middleware for API routes entirely
  if (nextUrl.pathname.startsWith('/api/')) {
    console.log(`[Middleware] Skipping API route: ${nextUrl.pathname}`)
    return NextResponse.next()
  }

  // Public routes
  const publicRoutes = [
    "/",
    "/about",
    "/events",
    "/membership",
    "/contact",
    "/blog",
    "/resources",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify",
    "/auth/verify-email",
    "/join",
    "/networking",
    "/testimonials",
    "/tech-demo"
  ]

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )

  // Allow public routes
  if (isPublicRoute) {
    console.log(`[Middleware] Allowing public route: ${nextUrl.pathname}`)
    return NextResponse.next()
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    "/dashboard",
    "/admin",
    "/api/members",
    "/api/events",
    "/api/payments"
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isLoggedIn) {
    console.log(`[Middleware] Redirecting to login: ${nextUrl.pathname}`)
    const loginUrl = new URL("/auth/sign-in", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin routes that require admin role
  const adminRoutes = ["/admin"]
  const isAdminRoute = adminRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )

  if (isAdminRoute && isLoggedIn) {
    const userRole = req.auth?.user?.role
    console.log(`[Middleware] Admin route check - userRole: ${userRole}`)
    if (userRole !== "ADMIN") {
      console.log(`[Middleware] Non-admin user accessing admin route, redirecting to dashboard`)
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
    }
  }

  console.log(`[Middleware] Allowing access to: ${nextUrl.pathname}`)
  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
} 