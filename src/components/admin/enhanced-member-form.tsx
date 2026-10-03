"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, UserPlus } from "lucide-react"
import { MEMBERSHIP_TIERS, TIERS_IN_ORDER, formatTierPrice } from "@/lib/membership-tiers"
import type { MembershipTier } from "@prisma/client"

/**
 * "Add member" for staff recording a member they already have on their books
 * (office-billed, or paid at the office). No card is charged and nothing is
 * emailed: the account is created ready for an invitation, which staff send from
 * Members → Invitations when they choose.
 */
interface EnhancedMemberFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CHECK", label: "Check" },
  { value: "CREDIT_CARD", label: "Card (taken at the office)" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
] as const

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "EXPIRED", label: "Expired" },
  { value: "INACTIVE", label: "Inactive" },
] as const

function oneYearFromTodayInput(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface FormState {
  firstName: string
  lastName: string
  email: string
  businessName: string
  phone: string
  membershipTier: MembershipTier | ""
  membershipStatus: string
  renewalDate: string
  paymentReceived: boolean
  /** Dollars, as typed. */
  paymentAmount: string
  paymentMethod: string
  paymentReference: string
}

const emptyForm = (): FormState => ({
  firstName: "",
  lastName: "",
  email: "",
  businessName: "",
  phone: "",
  membershipTier: "",
  membershipStatus: "ACTIVE",
  renewalDate: oneYearFromTodayInput(),
  paymentReceived: false,
  paymentAmount: "",
  paymentMethod: "CHECK",
  paymentReference: "",
})

export function EnhancedMemberForm({ isOpen, onClose, onSuccess }: EnhancedMemberFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm())
      setError(null)
    }
  }, [isOpen])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const selectTier = (tier: MembershipTier) => {
    setForm(prev => ({
      ...prev,
      membershipTier: tier,
      // The amount follows the tier until staff type their own.
      paymentAmount: String(MEMBERSHIP_TIERS[tier].priceCents / 100),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.membershipTier) {
      setError("Choose a membership tier.")
      return
    }
    let payment: { amountCents: number; method: string; reference?: string } | undefined
    if (form.paymentReceived) {
      const dollars = Number(form.paymentAmount)
      if (!Number.isFinite(dollars) || dollars <= 0) {
        setError("Enter the amount received, or untick Payment received.")
        return
      }
      payment = {
        amountCents: Math.round(dollars * 100),
        method: form.paymentMethod,
        reference: form.paymentReference.trim() || undefined,
      }
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/create-member-with-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          businessName: form.businessName,
          phone: form.phone,
          membershipTier: form.membershipTier,
          membershipStatus: form.membershipStatus,
          renewalDate: form.renewalDate || undefined,
          payment,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Failed to add member")
        return
      }
      onSuccess()
    } catch {
      setError("Could not reach the server. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open && !saving) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Member
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600">
          For members who join or pay through the office. No email is sent and no card is charged. The member
          sets up their sign-in from an invitation you send later from Members → Invitations.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="add-firstName">First name *</Label>
              <Input id="add-firstName" value={form.firstName} onChange={e => set("firstName", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="add-lastName">Last name *</Label>
              <Input id="add-lastName" value={form.lastName} onChange={e => set("lastName", e.target.value)} required />
            </div>
          </div>
          <div>
            <Label htmlFor="add-email">Email *</Label>
            <Input id="add-email" type="email" value={form.email} onChange={e => set("email", e.target.value)} required />
            <p className="mt-1 text-xs text-muted-foreground">This is the address they will sign in with.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="add-business">Business name</Label>
              <Input id="add-business" value={form.businessName} onChange={e => set("businessName", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="add-phone">Phone</Label>
              <Input id="add-phone" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="add-tier">Membership tier *</Label>
              <Select value={form.membershipTier || undefined} onValueChange={v => selectTier(v as MembershipTier)}>
                <SelectTrigger id="add-tier">
                  <SelectValue placeholder="Choose a tier" />
                </SelectTrigger>
                <SelectContent>
                  {TIERS_IN_ORDER.map(t => (
                    <SelectItem key={t.tier} value={t.tier}>
                      {t.label} ({formatTierPrice(t.priceCents)}/yr)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="add-status">Membership status</Label>
              <Select value={form.membershipStatus} onValueChange={v => set("membershipStatus", v)}>
                <SelectTrigger id="add-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="add-renewal">Renewal date</Label>
              <Input id="add-renewal" type="date" value={form.renewalDate} onChange={e => set("renewalDate", e.target.value)} />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="add-paid"
                checked={form.paymentReceived}
                onCheckedChange={v => set("paymentReceived", v === true)}
              />
              <Label htmlFor="add-paid">Payment received</Label>
            </div>
            {form.paymentReceived && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="add-amount">Amount ($)</Label>
                  <Input
                    id="add-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.paymentAmount}
                    onChange={e => set("paymentAmount", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="add-method">Method</Label>
                  <Select value={form.paymentMethod} onValueChange={v => set("paymentMethod", v)}>
                    <SelectTrigger id="add-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="add-ref">Reference (optional)</Label>
                  <Input
                    id="add-ref"
                    placeholder="Check no., receipt no."
                    value={form.paymentReference}
                    onChange={e => set("paymentReference", e.target.value)}
                  />
                </div>
              </div>
            )}
            {!form.paymentReceived && (
              <p className="text-xs text-muted-foreground">Leave unticked if no payment has come in; nothing is recorded.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
