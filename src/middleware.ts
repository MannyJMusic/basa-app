import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * Request-level protection for the signed-in areas (#138).
 *
 * The layouts under /admin, /dashboard and /dev each check the session, and they
 * still do (they are where the role rules live). But that is opt-in per section:
 * a new page tree only got protection if someone remembered the layout check, and
 * /blog/write had none. This denies by default inside those areas.
 *
 * Scope is deliberately the protected areas, not the whole site: denying every
 * unlisted path would send an old WordPress URL that should 404 to the sign-in
 * page instead, hiding the misses the post-cutover watch looks for (#242).
 *
 * Runs on the Node.js runtime (stable in Next 15.5), not the edge: the auth module
 * needs Prisma for the per-request session re-validation, and on the edge the
 * NEXTAUTH_SECRET could be inlined at build time, when the Docker build does not
 * have it. Node middleware reads it at runtime like the rest of the server.
 */
export const config = {
  runtime: 'nodejs',
  matcher: [
    '/admin', '/admin/:path*',
    '/dashboard', '/dashboard/:path*',
    '/dev', '/dev/:path*',
    '/blog/write', '/blog/write/:path*',
  ],
}

const ADMIN_ONLY = ['/admin', '/dev']
const within = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + '/')

// Redirects are built on the public origin, not the internal one nginx proxies to.
const origin = (fallback: string) => process.env.NEXTAUTH_URL || fallback

export default auth(req => {
  const { pathname, search } = req.nextUrl
  const user = req.auth?.user

  if (!user) {
    const to = new URL('/auth/sign-in', origin(req.nextUrl.origin))
    to.searchParams.set('callbackUrl', pathname + search)
    return NextResponse.redirect(to)
  }
  if (ADMIN_ONLY.some(p => within(pathname, p)) && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', origin(req.nextUrl.origin)))
  }
  return NextResponse.next()
})
