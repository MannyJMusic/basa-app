import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, isResponse } from "@/lib/api-auth"
import { csvCell } from "@/lib/csv"
import { STATUS_LABEL, filterTransactions, loadTransactions } from "@/lib/admin-payments"

// GET /api/admin/payments/export?q=&status= - the Payment Management list as CSV (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const { searchParams } = new URL(request.url)
    const rows = filterTransactions(await loadTransactions(), {
      q: searchParams.get("q") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    })

    const header = ["Date", "Type", "Description", "Details", "Customer", "Email", "Amount (USD)", "Method", "Status", "Stripe reference"]
    const lines = rows.map(t => [
      t.at.toISOString(),
      t.kind,
      t.title,
      t.detail ?? "",
      t.customerName,
      t.customerEmail,
      (t.amountCents / 100).toFixed(2),
      t.method,
      STATUS_LABEL[t.status],
      t.reference ?? "",
    ])
    const csv = [header, ...lines].map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n"

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="payments-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Error exporting payments:", error)
    return NextResponse.json({ error: "Failed to export payments" }, { status: 500 })
  }
}
