'use client'

import { useMemo, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { StripeForm } from '@/components/payments/stripe-form'
import { AlertCircle, Minus, Plus } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export interface RegistrationTier {
  id: string
  name: string
  description: string | null
  price: number
  memberPrice: number | null
  /** null means unlimited, still bounded by the event's own capacity */
  remaining: number | null
}

interface Props {
  eventId: string
  eventTitle: string
  tiers: RegistrationTier[]
  eventPlacesLeft: number | null
}

interface Attendee {
  name: string
  email: string
}

const money = (n: number) => `$${n.toFixed(2).replace(/\.00$/, '')}`

export function EventRegistrationForm({ eventId, eventTitle, tiers, eventPlacesLeft }: Props) {
  // Quantity per tier. A single-tier event still goes through the same path; it just
  // renders one row. Every event has at least a General Admission tier from the #54
  // migration, so there is no "no tiers" case to special-case here.
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    tiers.length === 1 ? { [tiers[0].id]: 1 } : {}
  )
  const [buyer, setBuyer] = useState({ name: '', email: '', company: '', phone: '' })
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [serverTotalCents, setServerTotalCents] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalTickets = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities]
  )

  // Indicative only. The server re-prices from the tier table when it creates the
  // PaymentIntent, and member pricing is applied there from the session rather than
  // from anything this component can assert.
  const indicativeTotal = useMemo(
    () =>
      tiers.reduce((sum, t) => sum + (quantities[t.id] ?? 0) * t.price, 0),
    [tiers, quantities]
  )

  const setQty = (tierId: string, next: number) => {
    const tier = tiers.find(t => t.id === tierId)
    if (!tier) return

    const otherTickets = Object.entries(quantities)
      .filter(([id]) => id !== tierId)
      .reduce((a, [, q]) => a + q, 0)

    // Bounded by the tier's own remaining count and by what is left of the event's
    // capacity across all tiers, so the stepper cannot offer a ticket that
    // priceSelection() would reject a moment later.
    let max = tier.remaining ?? Number.MAX_SAFE_INTEGER
    if (eventPlacesLeft !== null) max = Math.min(max, eventPlacesLeft - otherTickets)
    max = Math.min(max, 20 - otherTickets)

    const clamped = Math.max(0, Math.min(next, Math.max(0, max)))
    setQuantities(prev => {
      const copy = { ...prev }
      if (clamped === 0) delete copy[tierId]
      else copy[tierId] = clamped
      return copy
    })
    setAttendees(prev => prev.slice(0, otherTickets + clamped))
  }

  const setAttendee = (i: number, field: keyof Attendee, value: string) => {
    setAttendees(prev => {
      const copy = [...prev]
      while (copy.length <= i) copy.push({ name: '', email: '' })
      copy[i] = { ...copy[i], [field]: value }
      return copy
    })
  }

  const startCheckout = async () => {
    setError(null)

    if (totalTickets < 1) {
      setError('Choose at least one ticket.')
      return
    }
    if (!buyer.name.trim() || !buyer.email.trim()) {
      setError('Your name and email are required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/payments/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          items: Object.entries(quantities).map(([ticketTierId, quantity]) => ({
            ticketTierId,
            quantity,
          })),
          buyer: {
            name: buyer.name.trim(),
            email: buyer.email.trim(),
            company: buyer.company.trim() || undefined,
            phone: buyer.phone.trim() || undefined,
          },
          attendees: attendees
            .slice(0, totalTickets)
            .filter(a => a.name.trim())
            .map(a => ({ name: a.name.trim(), email: a.email.trim() || undefined })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        // 409 is the sold-out / sales-closed answer and carries a message worth showing.
        throw new Error(data.error || 'Could not start checkout')
      }

      setClientSecret(data.clientSecret)
      setServerTotalCents(data.totalCents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout')
    } finally {
      setSubmitting(false)
    }
  }

  if (clientSecret && serverTotalCents !== null) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripeForm
          clientSecret={clientSecret}
          amount={serverTotalCents / 100}
          description={`${totalTickets} ticket${totalTickets === 1 ? '' : 's'} — ${eventTitle}`}
          type="event"
          onSuccess={() => {
            /* StripeForm redirects to /payment/success itself. */
          }}
          onError={setError}
        />
      </Elements>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Choose tickets</CardTitle>
          <CardDescription>
            Member pricing is applied automatically at checkout if you are signed in with an
            active membership.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tiers.map(tier => {
            const qty = quantities[tier.id] ?? 0
            const soldOut = tier.remaining === 0
            return (
              <div key={tier.id} className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="font-medium">{tier.name}</p>
                  {tier.description && (
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  )}
                  <p className="text-sm text-gray-700 mt-1">
                    {money(tier.price)}
                    {tier.memberPrice !== null && tier.memberPrice !== tier.price && (
                      <span className="text-gray-500"> · {money(tier.memberPrice)} members</span>
                    )}
                  </p>
                  {tier.remaining !== null && (
                    <p className="text-xs text-gray-500 mt-1">
                      {soldOut ? 'Sold out' : `${tier.remaining} remaining`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button" variant="outline" size="icon"
                    onClick={() => setQty(tier.id, qty - 1)}
                    disabled={qty === 0}
                    aria-label={`Remove one ${tier.name}`}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center tabular-nums">{qty}</span>
                  <Button
                    type="button" variant="outline" size="icon"
                    onClick={() => setQty(tier.id, qty + 1)}
                    disabled={soldOut}
                    aria-label={`Add one ${tier.name}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}

          {totalTickets > 0 && (
            <>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>{totalTickets} ticket{totalTickets === 1 ? '' : 's'}</span>
                <span>{money(indicativeTotal)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buyer-name">Name *</Label>
            <Input id="buyer-name" value={buyer.name}
              onChange={e => setBuyer({ ...buyer, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="buyer-email">Email *</Label>
            <Input id="buyer-email" type="email" value={buyer.email}
              onChange={e => setBuyer({ ...buyer, email: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="buyer-company">Company</Label>
            <Input id="buyer-company" value={buyer.company}
              onChange={e => setBuyer({ ...buyer, company: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="buyer-phone">Phone</Label>
            <Input id="buyer-phone" value={buyer.phone}
              onChange={e => setBuyer({ ...buyer, phone: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {totalTickets > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Who is attending</CardTitle>
            <CardDescription>Optional, but it is what appears on the attendee list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: totalTickets }).map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder={`Attendee ${i + 1} name`}
                  value={attendees[i]?.name ?? ''}
                  onChange={e => setAttendee(i, 'name', e.target.value)}
                />
                <Input
                  type="email"
                  placeholder={`Attendee ${i + 1} email`}
                  value={attendees[i]?.email ?? ''}
                  onChange={e => setAttendee(i, 'email', e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={startCheckout}
        disabled={submitting || totalTickets < 1}
      >
        {submitting ? 'Preparing checkout…' : 'Continue to payment'}
      </Button>
    </div>
  )
}
