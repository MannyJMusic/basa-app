import MembershipHero from "@/components/membership/MembershipHero";
import ChapterMemberships from "@/components/membership/ChapterMemberships";
import ResourceMemberships from "@/components/membership/ResourceMemberships";
import ComparisonTable from "@/components/membership/ComparisonTable";
import MemberTestimonials from "@/components/membership/MemberTestimonials";
import MembershipFAQ from "@/components/membership/MembershipFAQ";

export default function MembershipPage() {
  return (
    <main>
      <MembershipHero />
      <nav className="sticky top-0 z-30 bg-white shadow-sm">
        {/* TODO: Add section links and quick-access buttons */}
      </nav>
      <section id="chapter-memberships">
        <ChapterMemberships />
      </section>
      <section id="resource-memberships">
        <ResourceMemberships />
      </section>
      <section id="comparison">
        <ComparisonTable />
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