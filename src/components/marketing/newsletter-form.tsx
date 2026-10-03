"use client"

import { useState } from "react"
import { CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string }

/**
 * Newsletter sign-up posting to the public POST /api/newsletter. The API
 * requires first name, last name and email, so all three are asked for.
 * `tone="dark"` styles it for dark backgrounds (footer, blue bands).
 */
export function NewsletterForm({
  source,
  tone = "light",
  className,
}: {
  /** Where the sign-up came from; recorded in the audit log. */
  source: string
  tone?: "light" | "dark"
  className?: string
}) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>({ kind: "idle" })

  const dark = tone === "dark"
  const inputClass = dark
    ? "bg-white/10 border-white/20 text-white placeholder:text-gray-300"
    : undefined
  const labelClass = dark ? "text-gray-200" : undefined
  const idPrefix = `newsletter-${source}`

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus({ kind: "submitting" })
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          source,
        }),
      })
      if (res.ok) {
        setStatus({ kind: "success" })
        return
      }
      if (res.status === 429) {
        setStatus({ kind: "error", message: "Too many attempts. Please wait a minute and try again." })
        return
      }
      const data = await res.json().catch(() => null)
      let message = "Something went wrong. Please try again."
      if (res.status === 400) {
        if (typeof data?.error === "string" && data.error.toLowerCase().includes("already subscribed")) {
          message = "That email address is already subscribed."
        } else {
          message = "Please enter your first name, last name and a valid email address."
        }
      }
      setStatus({ kind: "error", message })
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach the server. Please check your connection and try again." })
    }
  }

  if (status.kind === "success") {
    return (
      <div
        role="status"
        className={cn(
          "flex items-start gap-3 rounded-lg p-4",
          dark ? "bg-white/10 text-white" : "bg-green-50 text-green-800",
          className
        )}
      >
        <CheckCircle className={cn("mt-0.5 h-5 w-5 shrink-0", dark ? "text-green-300" : "text-green-600")} />
        <p>Thanks, you&apos;re subscribed to the BASA newsletter.</p>
      </div>
    )
  }

  const submitting = status.kind === "submitting"

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-first`} className={labelClass}>First name</Label>
          <Input
            id={`${idPrefix}-first`}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            maxLength={100}
            required
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${idPrefix}-last`} className={labelClass}>Last name</Label>
          <Input
            id={`${idPrefix}-last`}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            maxLength={100}
            required
            className={inputClass}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-email`} className={labelClass}>Email address</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>
      {status.kind === "error" && (
        <p role="alert" className={cn("text-sm", dark ? "text-red-300" : "text-red-700")}>
          {status.message}
        </p>
      )}
      <Button type="submit" disabled={submitting} className="w-full">
        <Mail className="mr-2 h-4 w-4" />
        {submitting ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  )
}
