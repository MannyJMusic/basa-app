import React from "react";
import Link from "next/link";

const tiers = [
  {
    name: "Meeting Member",
    price: "$149",
    border: "border-blue-400",
    badge: "Perfect for New Members",
    badgeColor: "bg-blue-100 text-blue-700",
    cta: "Start Networking",
    ctaColor: "bg-blue-600 hover:bg-blue-700",
    benefits: [
      "Special Rates at BASA Networking Events for 1 Employee",
      "Directory Listing on the BASA Website",
      "Receive a New Member 'Bundle Bag'",
      "Opportunity to provide Marketing Materials for the 'Bundle Bag'",
      "Access to the BASA Private Facebook Page",
      "Receive BASA Benefits from fellow members",
      "Opportunity to provide a BASA Benefit to your fellow members",
      "Membership Certificate"
    ]
  },
  {
    name: "Associate Member",
    price: "$245",
    border: "border-green-400",
    badge: "Most Popular",
    badgeColor: "bg-green-500 text-white",
    cta: "Join Associate",
    ctaColor: "bg-green-500 hover:bg-green-600",
    benefits: [
      "Special Rates at BASA Networking Events for 2 Employees",
      "Directory Listing on the BASA Website",
      "Receive a New Member 'Bundle Bag'",
      "Opportunity to provide Marketing Materials for the 'Bundle Bag'",
      "Access to the BASA Private Facebook Page",
      "2 shared E-Blasts per month (content provided by member)",
      "1 social media post per month (content provided by member)",
      "1 video post on social media per month (content provided by member)",
      "Receive BASA Benefits from fellow members",
      "Opportunity to provide a BASA Benefit to your fellow members",
      "Membership Certificate"
    ]
  },
  {
    name: "TRIO Member",
    price: "$295",
    border: "border-purple-500",
    badge: "All Chapters Access",
    badgeColor: "bg-purple-500 text-white",
    cta: "Go Premium",
    ctaColor: "bg-purple-600 hover:bg-purple-700",
    benefits: [
      "Membership in ALL THREE CHAPTERS",
      "Special Rates at BASA Networking Events for 1 Employee",
      "Directory Listing on the BASA Website",
      "Receive a New Member 'Bundle Bag'",
      "Access to the BASA Private Facebook Page",
      "Opportunity to provide Marketing Materials for the 'Bundle Bag'",
      "Receive BASA Benefits from fellow members",
      "Opportunity to provide a BASA Benefit to your fellow members",
      "Membership Certificate"
    ]
  }
];

const ChapterMemberships = () => {
  return (
    <section className="py-16 bg-white" id="chapter-memberships">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-sans">Chapter Memberships</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sans">
          In-person networking, local business community, and exclusive chapter benefits.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier, idx) => (
          <div
            key={tier.name}
            className={`border-t-4 ${tier.border} bg-white rounded-xl shadow-lg p-8 flex flex-col relative transition-transform hover:scale-105 min-h-[560px]`}
          >
            {/* Badge */}
            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-semibold ${tier.badgeColor} shadow`}>{tier.badge}</div>
            {/* Pricing */}
            <div className="text-4xl font-bold text-gray-900 mb-2 mt-2">{tier.price}</div>
            <div className="text-gray-500 mb-4">per year</div>
            {/* Benefits */}
            <ul className="space-y-3 mb-8 text-gray-700 text-sm flex-1">
              {tier.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">&#10003;</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {/* CTA */}
            <div className="mt-auto pt-2 flex items-end">
              <Link href={`/membership/join?tier=${tier.name.toLowerCase().replace(/\s/g, '-')}`} className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors shadow text-center block ${tier.ctaColor} text-white focus:ring-2 focus:ring-offset-2`}>
                {tier.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChapterMemberships; 