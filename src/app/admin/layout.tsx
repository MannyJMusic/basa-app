import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminShell } from "./admin-shell"

/**
 * Server-side gate for everything under /admin, the same pattern as
 * src/app/dashboard/layout.tsx. There is no request middleware in this app (the
 * auth module needs Prisma and bcrypt, which cannot run at the edge), so the
 * layouts are where page-level protection lives; API routes check auth themselves.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/sign-in?callbackUrl=%2Fadmin")
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }
  return <AdminShell>{children}</AdminShell>
}
