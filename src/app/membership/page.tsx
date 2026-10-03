import type { Metadata } from "next";
import MembershipHero from "@/components/membership/MembershipHero";
import MembershipLevels from "@/components/membership/MembershipLevels";
import ComparisonTable from "@/components/membership/ComparisonTable";
import MembershipFAQ from "@/components/membership/MembershipFAQ";
import { MembershipOfficeNotice } from "@/components/membership/MembershipOfficeNotice";
import { MEMBERSHIP_SALES_ENABLED } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Membership Levels | BASA",
  description: "Meeting, Market, Action, Mixer and Sponsorship memberships with the Business Association of San Antonio.",
};

export default function MembershipPage() {
  return (
    <>
      <MembershipHero salesEnabled={MEMBERSHIP_SALES_ENABLED} />
      {!MEMBERSHIP_SALES_ENABLED && (
        <section className="max-w-4xl mx-auto px-4 -mt-6 mb-6 relative z-40">
          <MembershipOfficeNotice variant="card" intent="join" />
        </section>
      )}
      <MembershipLevels salesEnabled={MEMBERSHIP_SALES_ENABLED} />
      <ComparisonTable salesEnabled={MEMBERSHIP_SALES_ENABLED} />
      <MembershipFAQ />
    </>
  );
}
