"use client";
import React, { useState } from "react";

const allTiers = [
  {
    name: "Meeting",
    color: "text-blue-500",
    price: "$149",
    type: "Full"
  },
  {
    name: "Associate",
    color: "text-green-500",
    price: "$245",
    type: "Full"
  },
  {
    name: "TRIO",
    color: "text-purple-500",
    price: "$295",
    type: "Full"
  },
  {
    name: "Class Resource",
    color: "text-blue-400",
    price: "$120",
    type: "Resource"
  },
  {
    name: "NAG Resource",
    color: "text-red-500",
    price: "Included",
    type: "Resource"
  },
  {
    name: "Training Resource",
    color: "text-yellow-500",
    price: "$225",
    type: "Resource"
  }
];

const allBenefits = [
  {
    label: "Event Discount",
    values: ["Special Rate", "Special Rate", "Special Rate", "Special Rate", "-", "Special Rate"]
  },
  {
    label: "# Employees Included",
    values: ["1", "2", "1 (All Chapters)", "-", "-", "1"]
  },
  {
    label: "Directory Listing",
    values: ["✓", "✓", "✓", "✓ Resource Page", "✓ Resource Page", "✓ Resource Page"]
  },
  {
    label: "Bundle Bag",
    values: ["✓", "✓", "✓", "✓", "✓", "✓"]
  },
  {
    label: "Social Media Welcome",
    values: ["✓", "✓", "✓", "✓", "✓", "✓"]
  },
  {
    label: "E-Blasts/Social Posts",
    values: ["-", "2/mo E-Blasts, 1/mo Social, 1/mo Video", "-", "-", "-", "-"],
    highlight: 1
  },
  {
    label: "Trainer/Panelist Opportunity",
    values: ["-", "-", "-", "-", "-", "✓"]
  },
  {
    label: "All Chapters Access",
    values: ["-", "-", "✓", "-", "-", "-"],
    highlight: 2
  },
  {
    label: "NAG Benefits Included",
    values: ["-", "-", "-", "-", "✓", "-"]
  },
  {
    label: "Annual Price",
    values: allTiers.map(t => t.price)
  }
];

const icon = (val: string) => {
  if (val === "✓") return <span className="text-green-500 font-bold">&#10003;</span>;
  if (val === "-") return <span className="text-gray-400">&mdash;</span>;
  return val;
};

const groups = [
  { label: "Full Memberships", type: "Full", indices: [0, 1, 2] },
  { label: "Resource Memberships", type: "Resource", indices: [3, 4, 5] }
];

const ComparisonTable = () => {
  const [group, setGroup] = useState(0); // 0: Full, 1: Resource
  const { indices } = groups[group];
  const tiers = indices.map(i => allTiers[i]);
  const benefits = allBenefits.map(b => ({
    ...b,
    values: indices.map(i => b.values[i]),
    highlight: b.highlight !== undefined && indices.includes(b.highlight) ? indices.indexOf(b.highlight) : undefined
  }));

  return (
    <section className="py-16 bg-white" id="comparison">
      <div className="max-w-5xl mx-auto px-4 border border-gray-200 rounded-xl shadow-lg bg-white">
        <div className="text-center mb-8 pt-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Compare Memberships</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            See which membership fits your needs. Toggle to compare full or resource memberships.
          </p>
          <div className="inline-flex rounded-lg shadow bg-gray-100 mb-4">
            {groups.map((g, i) => (
              <button
                key={g.type}
                className={`px-4 py-2 font-semibold text-sm md:text-base rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${group === i ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-blue-100'}`}
                onClick={() => setGroup(i)}
                aria-pressed={group === i}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card-based layout for mobile */}
        <div className="block md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-2 px-2">
            {tiers.map((tier, idx) => (
              <div key={tier.name} className="min-w-[260px] max-w-[320px] bg-gray-50 rounded-xl shadow-lg p-5 flex-shrink-0 border border-gray-200">
                <div className={`text-lg font-bold mb-1 ${tier.color}`}>{tier.name}</div>
                <div className="text-2xl font-bold mb-2">{tier.price}</div>
                <ul className="divide-y divide-gray-100">
                  {benefits.map((benefit, bidx) => (
                    <li key={benefit.label} className="py-2 flex items-center justify-between text-sm">
                      <span className="text-gray-700 w-1/2 pr-2">{benefit.label}</span>
                      <span className={`w-1/2 text-right ${benefit.highlight === idx ? 'bg-yellow-50 font-bold px-1 rounded' : ''}`}>{icon(benefit.values[idx])}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Table layout for desktop */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full min-w-[480px] border-collapse text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-900 bg-gray-50 sticky left-0 z-10 min-w-[180px] border-r border-gray-200">Benefit</th>
                {tiers.map(tier => (
                  <th key={tier.name} className={`text-center p-4 font-semibold ${tier.color} bg-gray-50 min-w-[120px] border-r border-gray-200`}>{tier.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {benefits.map((benefit, i) => (
                <tr key={benefit.label} className="border-b border-gray-200 last:border-b-0">
                  <td className="p-4 font-medium text-gray-700 bg-white sticky left-0 z-10 min-w-[180px] border-r border-gray-200">{benefit.label}</td>
                  {benefit.values.map((val, idx) => (
                    <td
                      key={idx}
                      className={`p-4 text-center bg-white border-r border-gray-200 ${benefit.highlight === idx ? 'bg-yellow-50 font-bold' : ''}`}
                    >
                      {icon(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable; 