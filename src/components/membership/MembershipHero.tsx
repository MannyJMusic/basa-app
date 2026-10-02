import Link from "next/link";

/** Top of /membership. No member counts or claims: only what the levels sheet says. */
export default function MembershipHero({ salesEnabled }: { salesEnabled: boolean }) {
  return (
    <section className="relative w-full flex items-center justify-center overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bg-[url('/images/backgrounds/basa-skyline.jpg')] bg-cover bg-center" aria-hidden="true" />
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Membership Levels</h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8">
          Five ways to grow your business with the Business Association of San Antonio, from member rates at our
          networking events to sponsorship of our signature tournaments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="#levels" className="py-3 px-8 rounded-lg font-semibold text-lg shadow-lg bg-amber-500 text-white hover:bg-amber-600">
            Compare the levels
          </Link>
          {salesEnabled && (
            <Link href="/membership/join" className="py-3 px-8 rounded-lg font-semibold text-lg shadow-lg bg-white text-blue-900 hover:bg-blue-50">
              Join online
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
