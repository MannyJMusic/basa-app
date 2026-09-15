import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Debug logging

  // Skip middleware for API routes entirely
  if (nextUrl.pathname.startsWith('/api/')) {
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
    "/testimonials",
    // Stripe returns guest ticket buyers here after checkout; they have no session.
    "/payment"
  ]

  // Exact match for "/", prefix match for the rest. `startsWith("/")` is true for
  // every path, which used to make every route public and left /dashboard and
  // /admin protected only by their own page-level checks.
  const isPublicRoute = publicRoutes.some(route =>
    route === "/" ? nextUrl.pathname === "/" : nextUrl.pathname === route || nextUrl.pathname.startsWith(route + "/")
  )

  // Allow public routes
  if (isPublicRoute) {
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
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
    }
  }

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