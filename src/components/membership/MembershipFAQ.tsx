"use client";
import React, { useState } from "react";

const faqs = [
  {
    q: "What is the difference between Chapter and Resource Memberships?",
    a: "Chapter Memberships focus on in-person networking, local events, and chapter-specific benefits in Stone Oak, Center of City, and Southside. Resource Memberships are digital-first, offering online benefits and select physical perks for remote or digital-focused members."
  },
  {
    q: "Can I upgrade from a Resource Membership to a Chapter Membership?",
    a: "Yes! You can upgrade at any time. Contact BASA support to apply your current resource membership toward a chapter membership."
  },
  {
    q: "Where are the BASA chapters located?",
    a: "BASA has chapters in Stone Oak, Center of City, and Southside. Each chapter hosts regular networking events and provides location-specific benefits."
  },
  {
    q: "What digital benefits are included with Resource Memberships?",
    a: "Resource Memberships include access to the BASA Resource Website, private Facebook group, directory listing, digital marketing opportunities, and more."
  },
  {
    q: "Are there opportunities to promote my business?",
    a: "Yes! All memberships include directory listings and welcome posts. Associate Members and above receive additional social media and e-blast opportunities."
  },
  {
    q: "How do I join or get more information?",
    a: "You can join directly from this page or contact us for a personalized consultation. We're here to help you choose the best membership for your business."
  }
];

const MembershipFAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gray-100" id="faq">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Answers to common questions about BASA memberships, benefits, and joining.
        </p>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4">
            <button
              className="w-full text-left flex justify-between items-center font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 py-2"
              aria-expanded={open === idx}
              aria-controls={`faq-panel-${idx}`}
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              <span>{faq.q}</span>
              <span className="ml-4 text-blue-500">{open === idx ? '-' : '+'}</span>
            </button>
            <div
              id={`faq-panel-${idx}`}
              className={`mt-2 text-gray-600 text-sm transition-all duration-300 ease-in-out ${open === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
              aria-hidden={open !== idx}
            >
              {faq.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MembershipFAQ; 