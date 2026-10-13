import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign, Search, Download } from "lucide-react"
import { TransactionRow } from "./transaction-row"
import {
  PAGE_SIZE,
  STATUS_LABEL,
  filterTransactions,
  loadTransactions,
  summarize,
  type TransactionStatus,
} from "@/lib/admin-payments"

export const dynamic = "force-dynamic"

const dollars = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)

type Search = { q?: string; status?: string; page?: string }

function href(params: Search, overrides: Partial<Search>, base = "/admin/payments") {
  const next = { ...params, ...overrides }
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(next)) if (v) qs.set(k, v)
  const s = qs.toString()
  return s ? `${base}?${s}` : base
}

/**
 * Every recorded payment: memberships and renewals, ticket sales, and declined
 * membership charges (see src/lib/admin-payments.ts for the sources). Stripe stays
 * the system of record for refunds and disputes. The admin layout's gate applies.
 */
export default async function PaymentsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams
  const all = await loadTransactions()
  const summary = summarize(all)
  const filtered = filterTransactions(all, params)
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(Math.max(parseInt(params.page ?? "1", 10) || 1, 1), pages)
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const change =
    summary.lastMonthCents > 0
      ? Math.round(((summary.thisMonthCents - summary.lastMonthCents) / summary.lastMonthCents) * 100)
      : null

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-2">Memberships, renewals and ticket sales recorded on this site</p>
        </div>
        <Button asChild className="flex items-center gap-2">
          <a href={href(params, { page: undefined }, "/api/admin/payments/export")}>
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dollars(summary.revenueCents)}</div>
            <p className="text-xs text-gray-500">
              {summary.completedCount} completed · {dollars(summary.thisMonthCents)} this month
              {change !== null ? ` (${change >= 0 ? "+" : ""}${change}% vs last month)` : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{dollars(summary.pendingCents)}</div>
            <p className="text-xs text-gray-500">{summary.pendingCount} transaction{summary.pendingCount === 1 ? "" : "s"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dollars(summary.failedCents)}</div>
            <p className="text-xs text-gray-500">{summary.failedCount} transaction{summary.failedCount === 1 ? "" : "s"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dollars(summary.refundedCents)}</div>
            <p className="text-xs text-gray-500">
              {summary.refundedCount} transaction{summary.refundedCount === 1 ? "" : "s"} · refunds made only in Stripe are not listed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form method="get" className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[12rem] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input name="q" defaultValue={params.q ?? ""} placeholder="Search name, email, event or Stripe id..." className="pl-10" />
            </div>
            <select
              name="status"
              defaultValue={params.status ?? ""}
              aria-label="Status"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All statuses</option>
              {(Object.keys(STATUS_LABEL) as TransactionStatus[]).map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <Button type="submit" variant="outline">Apply</Button>
            {(params.q || params.status) && (
              <Button asChild variant="ghost"><Link href="/admin/payments">Clear</Link></Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-700" /> Transactions ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-gray-600">
              {all.length === 0 ? "No payments have been recorded yet." : "No transactions match that search."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Transaction</th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Method</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(t => (
                    <TransactionRow key={t.id} t={t} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-between pt-4 text-sm text-gray-600">
              <span>Page {page} of {pages}</span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Button asChild variant="outline" size="sm"><Link href={href(params, { page: String(page - 1) })}>Previous</Link></Button>
                )}
                {page < pages && (
                  <Button asChild variant="outline" size="sm"><Link href={href(params, { page: String(page + 1) })}>Next</Link></Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
