import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminShell } from "./admin-shell"

/**
 * Server-side gate for everything under /admin, the same pattern as
 * src/app/dashboard/layout.tsx. src/middleware.ts (Node runtime, #138) already
 * turns away anonymous and non-admin requests for /admin; this layout keeps the
 * same rule as a second line and is where the role check is documented. API
 * routes check auth themselves.
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
