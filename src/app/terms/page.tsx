import type { Metadata } from "next"
import Link from "next/link"
import { OFFICE_CONTACT } from "@/lib/feature-flags"

export const metadata: Metadata = {
  title: "Terms of Service | BASA - Business Association of San Antonio",
  description: "Terms for using the Business Association of San Antonio website, membership terms and event tickets.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <article className="max-w-3xl mx-auto space-y-8 text-gray-700 leading-relaxed">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
            <p className="text-sm text-gray-500">Last updated: October 2, 2026</p>
          </header>

          <p>
            These terms apply to your use of the Business Association of San Antonio
            (&quot;BASA&quot;, &quot;we&quot;) website, to BASA memberships and to event tickets
            bought through the site.
          </p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Using this website</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Give accurate information when you register, buy tickets or update your profile.</li>
              <li>Keep your sign-in details to yourself; you are responsible for activity on your account.</li>
              <li>
                Do not misuse the site, for example by trying to get into accounts or areas that
                are not yours, or by using member directory details to send spam.
              </li>
              <li>
                We may suspend or close an account that breaks these terms.
              </li>
            </ul>
            <p>
              How we handle your information is described in our{" "}
              <Link href="/privacy" className="underline">privacy policy</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Membership terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Memberships are yearly and renew automatically at the same price until cancelled.
              </li>
              <li>
                You can cancel at any time from the member dashboard. Cancellation takes effect at
                the end of the year you have paid for.
              </li>
              <li>
                For as long as your membership continues, you are protected from rate increases
                and changes to your package.
              </li>
              <li>
                Monthly payment is available for the Mixer and Sponsorship levels by arrangement
                with the BASA office. Monthly payment requires 30 days&apos; notice to cancel and
                can only be cancelled after twelve monthly charges.
              </li>
              <li>
                Meltdown Media, LLC/BASA is not responsible for errors in ads provided by members,
                or in ads proofed and approved by members for digital distribution.
              </li>
              <li>A $50 NSF fee applies to returned checks.</li>
            </ul>
            <p>
              Current membership levels and what each includes are listed on the{" "}
              <Link href="/membership" className="underline">membership page</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Event tickets</h2>
            <p>
              Ticket prices, member and non-member rates, and any refund or transfer terms are as
              shown on each event&apos;s page at the time you buy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Changes</h2>
            <p>
              If we change these terms we will update this page and the date at the top.
            </p>
          </section>

          <p>
            Questions about these terms? Contact the BASA office at{" "}
            <a href={`mailto:${OFFICE_CONTACT.email}`} className="underline">{OFFICE_CONTACT.email}</a>{" "}
            or <a href={OFFICE_CONTACT.phoneHref} className="underline">{OFFICE_CONTACT.phone}</a>, or use our{" "}
            <Link href="/contact" className="underline">contact page</Link>.
          </p>
        </article>
      </div>
    </div>
  )
}
