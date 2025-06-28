import React from "react";
import Link from "next/link";

const resources = [
  {
    name: "Class Resource Member",
    price: "$120",
    priceNote: "Annual Rate",
    border: "border-blue-500",
    bg: "bg-blue-800",
    cta: "Join Class Resource",
    ctaColor: "bg-blue-600 hover:bg-blue-700",
    benefits: [
      "Special rates for one at monthly training class",
      "Directory listing on the BASA Resource Page",
      "Access to BASA Resource Website & Private Facebook Page",
      "Bundle Bag - provide marketing materials",
      "Receive a BASA Bundle Bag",
      "Receive BASA Benefits from fellow BASA Members",
      "Provide a BASA Benefit to fellow BASA Members",
      "Welcome post on social media outlets"
    ]
  },
  {
    name: "NAG Resource Member",
    price: "Included",
    priceNote: "Best Value",
    border: "border-red-500",
    bg: "bg-red-700 scale-105 shadow-xl z-10",
    cta: "Join NAG (Networking & Giving)",
    ctaColor: "bg-red-600 hover:bg-red-700",
    badge: "Best Value",
    badgeColor: "bg-red-500 text-white",
    benefits: [
      "As a 'Networking & Giving' NAG Member, the benefits of a Resource Member are included."
    ]
  },
  {
    name: "Training Resource Member",
    price: "$225",
    priceNote: "Annual Rate",
    border: "border-yellow-500",
    bg: "bg-yellow-700",
    cta: "Join Training Resource",
    ctaColor: "bg-yellow-500 hover:bg-yellow-600 text-gray-900",
    benefits: [
      "Guaranteed seat for one at monthly training class",
      "Special rate for additional attendees to training classes",
      "Opportunity to be a trainer/panelist within the year",
      "Directory listing on the BASA Resource Page",
      "Access to BASA Resource Website & Private Facebook Page",
      "Bundle Bag - provide marketing materials",
      "Receive a BASA Bundle Bag",
      "Receive BASA Benefits from fellow BASA Members",
      "Provide a BASA Benefit to fellow BASA Members",
      "Welcome post on social media outlets"
    ]
  }
];

const ResourceMemberships = () => {
  return (
    <section className="py-16 bg-gray-900 text-white" id="resource-memberships">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient-gold">Not Ready for Full Membership? Try Our Resource Options</h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Digital-focused benefits with select physical perks.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {resources.map((res, idx) => (
          <div
            key={res.name}
            className={`relative border-t-4 ${res.border} ${res.bg} bg-opacity-90 rounded-xl shadow-lg p-8 flex flex-col items-center transition-transform hover:scale-105 min-h-[480px]`}
            style={idx === 1 ? { zIndex: 10 } : {}}
          >
            {/* Badge for NAG */}
            {res.badge && (
              <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold ${res.badgeColor} shadow-lg flex items-center gap-2`}>
                <span>★</span> {res.badge}
              </div>
            )}
            {/* Name */}
            <div className="text-2xl font-bold mb-2 text-white text-center">{res.name}</div>
            {/* Pricing */}
            <div className={`text-4xl font-bold mb-1 ${res.price === 'Included' ? 'text-red-400' : 'text-white'}`}>{res.price}</div>
            <div className="text-gray-200 mb-4">{res.priceNote}</div>
            {/* Benefits */}
            <ul className="space-y-3 mb-8 text-gray-100 text-sm text-left max-w-xs mx-auto">
              {res.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">&#10003;</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {/* CTA */}
            <Link href={`/membership/join?tier=${res.name.toLowerCase().replace(/\s/g, '-')}`} className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors shadow text-center block mt-auto ${res.ctaColor} focus:ring-2 focus:ring-offset-2 focus:ring-white`}>
              {res.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResourceMemberships; 