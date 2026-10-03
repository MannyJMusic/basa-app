'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, Lock, AlertTriangle } from 'lucide-react'
import { TIERS_IN_ORDER, MEMBERSHIP_TERMS, formatTierPrice } from '@/lib/membership-tiers'

interface Account {
  email: string
  firstName: string
  lastName: string
  businessName: string
  phone: string
  website: string
  businessAddress: string
  city: string
  state: string
  zipCode: string
}

interface Props {
  initialTier: string | null
  canceled: boolean
  /** Set when the buyer is signed in: the membership goes on that account and its email. */
  account: Account | null
}

const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-gray-100'

function Field({ label, name, required, children }: { label: string; name: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={name} className="block text-sm font-medium text-gray-800">
      {label}{required && <span className="text-red-600"> *</span>}
      {children}
    </label>
  )
}

/** One-page join form. Payment happens on Stripe Checkout, reached from here. */
export default function JoinForm({ initialTier, canceled, account }: Props) {
  const [tier, setTier] = useState<string | null>(initialTier)
  const [form, setForm] = useState({
    firstName: account?.firstName ?? '',
    lastName: account?.lastName ?? '',
    email: account?.email ?? '',
    phone: account?.phone ?? '',
    businessName: account?.businessName ?? '',
    website: account?.website ?? '',
    businessAddress: account?.businessAddress ?? '',
    city: account?.city ?? '',
    state: account?.state || 'TX',
    zipCode: account?.zipCode ?? '',
  })
  const [showInDirectory, setShowInDirectory] = useState(true)
  const [showAddress, setShowAddress] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = TIERS_IN_ORDER.find((t) => t.slug === tier) ?? null
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) { setError('Choose a membership level.'); return }
    if (!acceptTerms) { setError('Please accept the membership terms.'); return }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/payments/membership', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tier: selected.slug, ...form, showInDirectory, showAddress, acceptTerms }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.url) {
        setError(json.error ?? `Something went wrong (${res.status}). Please try again or call the office.`)
        setBusy(false)
        return
      }
      window.location.assign(json.url)
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
      setBusy(false)
    }
  }

  return (
    <div className="bg-gray-50 py-12">
      <form onSubmit={submit} className="max-w-5xl mx-auto px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Join BASA</h1>
          <p className="mt-2 text-gray-600">
            Choose your level, tell us about your business, and pay securely with Stripe.{' '}
            <Link href="/membership#compare" className="text-blue-700 underline">Compare the levels</Link>
          </p>
        </div>

        {canceled && (
          <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />
            Checkout was cancelled and you have not been charged. You can try again below.
          </div>
        )}

        <fieldset className="rounded-xl border border-gray-200 bg-white p-6">
          <legend className="px-2 text-lg font-semibold text-gray-900">1. Membership level</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" role="radiogroup" aria-label="Membership level">
            {TIERS_IN_ORDER.map((t) => {
              const on = t.slug === tier
              return (
                <button
                  key={t.slug}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => { setTier(t.slug); setError(null) }}
                  className={`rounded-lg border p-4 text-left transition ${on ? 'border-blue-700 bg-blue-50 ring-2 ring-blue-600' : 'border-gray-200 hover:border-blue-400'}`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{t.name}</span>
                    {on && <Check className="h-4 w-4 text-blue-700" aria-hidden="true" />}
                  </span>
                  <span className="mt-1 block text-xl font-bold text-gray-900">{formatTierPrice(t.priceCents)}<span className="text-sm font-normal text-gray-500">/yr</span></span>
                  <span className="mt-1 block text-xs text-gray-600">{t.eventCoverage}</span>
                </button>
              )
            })}
          </div>
          {selected && (
            <details className="mt-4 text-sm text-gray-700">
              <summary className="cursor-pointer font-medium text-blue-800">What the {selected.name} level includes</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">{selected.benefits.map((b) => <li key={b}>{b}</li>)}</ul>
            </details>
          )}
        </fieldset>

        <fieldset className="rounded-xl border border-gray-200 bg-white p-6">
          <legend className="px-2 text-lg font-semibold text-gray-900">2. You and your business</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <Field label="First name" name="firstName" required><input id="firstName" name="firstName" required autoComplete="given-name" className={inputClass} value={form.firstName} onChange={set('firstName')} /></Field>
            <Field label="Last name" name="lastName" required><input id="lastName" name="lastName" required autoComplete="family-name" className={inputClass} value={form.lastName} onChange={set('lastName')} /></Field>
            <Field label="Email" name="email" required>
              <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} value={form.email} onChange={set('email')} disabled={!!account} />
              {account && <span className="mt-1 block text-xs font-normal text-gray-500">The membership goes on the account you are signed in with.</span>}
            </Field>
            <Field label="Phone" name="phone"><input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} value={form.phone} onChange={set('phone')} /></Field>
            <Field label="Business name" name="businessName" required><input id="businessName" name="businessName" required autoComplete="organization" className={inputClass} value={form.businessName} onChange={set('businessName')} /></Field>
            <Field label="Website" name="website"><input id="website" name="website" type="text" inputMode="url" autoComplete="url" placeholder="yourbusiness.com" className={inputClass} value={form.website} onChange={set('website')} /></Field>
            <div className="sm:col-span-2">
              <Field label="Business address" name="businessAddress"><input id="businessAddress" name="businessAddress" autoComplete="street-address" className={inputClass} value={form.businessAddress} onChange={set('businessAddress')} /></Field>
            </div>
            <Field label="City" name="city"><input id="city" name="city" autoComplete="address-level2" className={inputClass} value={form.city} onChange={set('city')} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="State" name="state"><input id="state" name="state" autoComplete="address-level1" className={inputClass} value={form.state} onChange={set('state')} /></Field>
              <Field label="ZIP" name="zipCode"><input id="zipCode" name="zipCode" autoComplete="postal-code" className={inputClass} value={form.zipCode} onChange={set('zipCode')} /></Field>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={showInDirectory} onChange={(e) => setShowInDirectory(e.target.checked)} /> List my business in the BASA member directory</label>
            <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={showAddress} onChange={(e) => setShowAddress(e.target.checked)} disabled={!showInDirectory} /> Show my business address in the directory</label>
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-gray-200 bg-white p-6">
          <legend className="px-2 text-lg font-semibold text-gray-900">3. Membership terms</legend>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            {MEMBERSHIP_TERMS.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <label className="mt-4 flex items-start gap-2 text-sm font-medium text-gray-900">
            <input type="checkbox" className="mt-1" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            <span>
              I agree to these terms and the <Link href="/terms" className="text-blue-700 underline" target="_blank">terms of membership</Link>
              {selected ? `, and authorise BASA to charge ${formatTierPrice(selected.priceCents)} today and each year until I cancel.` : '.'}
            </span>
          </label>
        </fieldset>

        {error && (
          <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden="true" />{error}
          </div>
        )}

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1 text-xs text-gray-500"><Lock className="h-3.5 w-3.5" aria-hidden="true" /> Card details are entered on Stripe&apos;s secure page, never on this site.</p>
          <button
            type="submit"
            disabled={busy || !selected || !acceptTerms}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-8 py-3 font-semibold text-white shadow hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {selected ? `Continue to payment: ${formatTierPrice(selected.priceCents)}/yr` : 'Choose a level to continue'}
          </button>
        </div>
      </form>
    </div>
  )
}
