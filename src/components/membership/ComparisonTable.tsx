import { Check, Minus } from "lucide-react";
import { TIERS_IN_ORDER, formatTierPrice } from "@/lib/membership-tiers";

/**
 * Side-by-side view of the levels. Rows are the benefits that differ between
 * levels; the per-level wording lives in the cards above. Server component.
 */
const ROWS: Array<{ label: string; values: Record<string, string | boolean> }> = [
  { label: "Employees at member event rates", values: { meeting: "1", market: "1", action: "2", mixer: "Mixers included for 2", sponsorship: "Mixers included for 2" } },
  { label: "Directory listing", values: { meeting: true, market: true, action: true, mixer: "With link", sponsorship: "With link" } },
  { label: "Shared e-blasts per month", values: { meeting: "1", market: "1", action: "2", mixer: "4", sponsorship: "4" } },
  { label: "Social media posts per month", values: { meeting: "1", market: "2", action: "2", mixer: "4", sponsorship: "4" } },
  { label: "Video posts per month", values: { meeting: false, market: "1", action: "1", mixer: "2", sponsorship: "2" } },
  { label: "Ribbon cutting", values: { meeting: false, market: true, action: "Or Member Rally", mixer: true, sponsorship: "At your business" } },
  { label: "Guest at member rate", values: { meeting: false, market: false, action: true, mixer: "Guest at mixers", sponsorship: "Guest at mixers" } },
  { label: "Table at selected events", values: { meeting: false, market: false, action: true, mixer: true, sponsorship: false } },
  { label: "The BASA Channel", values: { meeting: false, market: false, action: "4 episodes", mixer: "6 episodes", sponsorship: "10 episodes" } },
  { label: "Golf & Bowling Tournament sponsor", values: { meeting: false, market: false, action: false, mixer: false, sponsorship: true } },
  { label: "Mixer signage and two-minute speech", values: { meeting: false, market: false, action: false, mixer: false, sponsorship: true } },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check className="mx-auto h-5 w-5 text-green-600" aria-label="Included" />;
  if (v === false) return <Minus className="mx-auto h-5 w-5 text-gray-300" aria-label="Not included" />;
  return <span>{v}</span>;
}

export default function ComparisonTable({ salesEnabled }: { salesEnabled: boolean }) {
  return (
    <section id="compare" className="py-16 bg-white scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">Compare the levels</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th scope="col" className="p-3 text-left font-semibold">Benefit</th>
                {TIERS_IN_ORDER.map((t) => (
                  <th key={t.tier} scope="col" className="p-3 text-center font-semibold">
                    {t.name}
                    {salesEnabled && <div className="font-normal text-blue-100">{formatTierPrice(t.priceCents)}/yr</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr key={row.label} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                  <th scope="row" className="p-3 text-left font-medium text-gray-800">{row.label}</th>
                  {TIERS_IN_ORDER.map((t) => (
                    <td key={t.tier} className="p-3 text-center text-gray-700"><Cell v={row.values[t.slug]} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500">Every level includes a name badge lanyard, the New Member Bundle Bag, BASA member benefits and a membership certificate.</p>
      </div>
    </section>
  );
}
