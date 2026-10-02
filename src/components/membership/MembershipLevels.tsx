import Link from "next/link";
import { Check } from "lucide-react";
import { TIERS_IN_ORDER, MEMBERSHIP_NOTES, formatTierPrice } from "@/lib/membership-tiers";
import { MembershipOfficeNotice } from "@/components/membership/MembershipOfficeNotice";

/** The five levels as cards, straight from src/lib/membership-tiers.ts. Server component. */
export default function MembershipLevels({ salesEnabled }: { salesEnabled: boolean }) {
  return (
    <section id="levels" className="py-16 bg-gray-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-3">Choose your level</h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Every level is a yearly membership that renews until you cancel, at the price you joined at.
        </p>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {TIERS_IN_ORDER.map((t) => (
            <div
              key={t.tier}
              id={t.slug}
              className={`flex flex-col rounded-xl bg-white p-6 shadow-sm border ${t.highlighted ? "border-amber-400 ring-2 ring-amber-300" : "border-gray-200"}`}
            >
              {t.highlighted && (
                <span className="self-start mb-2 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">Most popular</span>
              )}
              <h3 className="text-xl font-bold text-blue-900">{t.name}</h3>
              <p className="mt-2">
                <span className="text-3xl font-bold text-gray-900">{formatTierPrice(t.priceCents)}</span>
                <span className="text-gray-500"> / year</span>
              </p>
              <p className="mt-2 text-sm text-gray-600">{t.eventCoverage}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 flex-1">
                {t.benefits.slice(1).map((b) => (
                  <li key={b} className="flex gap-2">
                    <Check className="h-4 w-4 mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {t.monthlyByArrangement && (
                <p className="mt-4 text-xs text-gray-500">Monthly payments available through the office.</p>
              )}
              <div className="mt-6">
                {salesEnabled ? (
                  <Link
                    href={`/membership/join?tier=${t.slug}`}
                    className={`block w-full rounded-lg py-2.5 text-center font-semibold ${t.highlighted ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-blue-900 text-white hover:bg-blue-800"}`}
                  >
                    Join as {t.name}
                  </Link>
                ) : (
                  <MembershipOfficeNotice variant="inline" intent="join" />
                )}
              </div>
            </div>
          ))}
        </div>
        <ul className="mt-10 space-y-1 text-sm text-gray-600 max-w-3xl mx-auto list-disc pl-5">
          {MEMBERSHIP_NOTES.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </div>
    </section>
  );
}
