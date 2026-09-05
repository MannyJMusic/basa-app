import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound()
  const session = await auth()
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/dev")
  if (session.user.role !== "ADMIN") redirect("/dashboard")
  return <>{children}</>
}
