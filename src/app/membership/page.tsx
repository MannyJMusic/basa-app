import MembershipHero from "@/components/membership/MembershipHero";
import ChapterMemberships from "@/components/membership/ChapterMemberships";
import ResourceMemberships from "@/components/membership/ResourceMemberships";
import ComparisonTable from "@/components/membership/ComparisonTable";
import MemberTestimonials from "@/components/membership/MemberTestimonials";
import MembershipFAQ from "@/components/membership/MembershipFAQ";
import { MembershipOfficeNotice } from "@/components/membership/MembershipOfficeNotice";
import { MEMBERSHIP_SALES_ENABLED } from "@/lib/feature-flags";

export default function MembershipPage() {
  return (
    <main>
      <MembershipHero />
      {!MEMBERSHIP_SALES_ENABLED && (
        <section className="max-w-4xl mx-auto px-4 -mt-6 mb-6 relative z-40">
          <MembershipOfficeNotice variant="card" intent="join" />
        </section>
      )}
      <nav className="sticky top-0 z-30 bg-white shadow-xs">
        {/* TODO: Add section links and quick-access buttons */}
      </nav>
      <section id="chapter-memberships">
        <ChapterMemberships />
      </section>
      <section id="resource-memberships">
        <ResourceMemberships />
      </section>
      <section id="comparison">
        <ComparisonTable salesEnabled={MEMBERSHIP_SALES_ENABLED} />
      </section>
      <section id="testimonials">
        <MemberTestimonials />
      </section>
      <section id="faq">
        <MembershipFAQ />
      </section>
    </main>
  );
} 