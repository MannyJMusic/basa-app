import type { Metadata } from "next"
import Link from "next/link"
import { OFFICE_CONTACT } from "@/lib/feature-flags"

export const metadata: Metadata = {
  title: "Privacy Policy | BASA - Business Association of San Antonio",
  description: "What information the Business Association of San Antonio website collects and how it is used.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="container mx-auto px-4">
        <article className="max-w-3xl mx-auto space-y-8 text-gray-700 leading-relaxed">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last updated: October 2, 2026</p>
          </header>

          <p>
            This page explains what information the Business Association of San Antonio
            (&quot;BASA&quot;, &quot;we&quot;) collects through this website and how we use it.
          </p>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">What we collect</h2>
            <p>We collect the contact and business details you give us when you:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>become or renew as a member, or the BASA office sets up your membership;</li>
              <li>register for an event or buy event tickets;</li>
              <li>subscribe to our newsletter;</li>
              <li>send us a message through the contact form;</li>
              <li>update your member profile.</li>
            </ul>
            <p>
              This can include your name, email address, phone number, business name, business
              address, website and the other profile details you choose to add.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">How we use it</h2>
            <p>
              We use this information to run your membership, manage event registrations and
              tickets, send the newsletter you asked for, answer your messages and keep the site
              working and secure. We do not sell your information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Services we use</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Payments</strong> are processed by Stripe. Card details are entered
                into Stripe&apos;s payment form and go straight to Stripe; they never touch
                BASA&apos;s servers. We keep a record of each payment (amount, date and what it
                was for).
              </li>
              <li>
                <strong>Email</strong>, such as receipts, tickets, account messages and the
                newsletter, is sent through Mailgun.
              </li>
              <li>
                <strong>Error monitoring</strong> is provided by Sentry, which receives technical
                details when something on the site goes wrong so we can fix it.
              </li>
              <li>
                <strong>Signing in</strong> works with an email address and password, or with
                your Google account. If you use Google, we receive your name and email address
                from Google to match you to your BASA account.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Member directory</h2>
            <p>
              Signed-in members can see a member directory. Your business details appear there
              only as you choose in your profile settings, for example whether your address is
              shown and whether other members may contact you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Cookies</h2>
            <p>
              The site uses cookies to keep you signed in and to make forms and checkout work.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Seeing, changing or deleting your information</h2>
            <p>
              Members can update most of their details from the member dashboard. To get a copy
              of the information we hold about you, correct it, or ask us to delete it, contact
              the BASA office at{" "}
              <a href={`mailto:${OFFICE_CONTACT.email}`} className="underline">{OFFICE_CONTACT.email}</a>{" "}
              or <a href={OFFICE_CONTACT.phoneHref} className="underline">{OFFICE_CONTACT.phone}</a>.
              We may need to keep payment records where the law requires it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Changes</h2>
            <p>
              If we change this policy we will update this page and the date at the top.
            </p>
          </section>

          <p>
            Questions about this policy? Contact the BASA office at{" "}
            <a href={`mailto:${OFFICE_CONTACT.email}`} className="underline">{OFFICE_CONTACT.email}</a>{" "}
            or <a href={OFFICE_CONTACT.phoneHref} className="underline">{OFFICE_CONTACT.phone}</a>, or use our{" "}
            <Link href="/contact" className="underline">contact page</Link>. See also our{" "}
            <Link href="/terms" className="underline">terms</Link>.
          </p>
        </article>
      </div>
    </div>
  )
}
