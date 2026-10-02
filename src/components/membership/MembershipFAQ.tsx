"use client";
import React, { useState } from "react";

const faqs = [
  {
    q: "How does billing work?",
    a: "Memberships are yearly. When you join online your card is charged today and again on the same date each year, at the price you joined at, until you cancel."
  },
  {
    q: "How do I cancel?",
    a: "Sign in and open My Membership in your member dashboard, then choose Manage billing. Cancelling stops the next renewal; your membership stays active until the end of the year you have paid for."
  },
  {
    q: "Can I pay monthly?",
    a: "Mixer and Sponsorship members can arrange monthly payments with the BASA office. Monthly memberships need 30 days' notice to cancel and can be cancelled after twelve monthly payments."
  },
  {
    q: "What is the BASA Channel?",
    a: "The BASA Channel features member businesses in video episodes. Action, Mixer and Sponsorship levels include episodes, and it can be added to any membership for $400 per month, with quarterly payment options, through the office."
  },
  {
    q: "Can I change my level later?",
    a: "Yes. Contact the BASA office and we will move you to the level that fits, crediting what you have already paid."
  },
  {
    q: "What happens after I join?",
    a: "You get a welcome email with a link to set up your member account. The office then gets in touch about your Bundle Bag, name badge, directory listing and the marketing included in your level."
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
          <div key={idx} className="bg-white rounded-lg shadow-sm p-4">
            <button
              className="w-full text-left flex justify-between items-center font-semibold text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-blue-400 py-2"
              aria-expanded={open === idx}
              aria-controls={`faq-panel-${idx}`}
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              <span>{faq.q}</span>
              <span className="ml-4 text-blue-500">{open === idx ? '-' : '+'}</span>
            </button>
            <div
              id={`faq-panel-${idx}`}
              className={`mt-2 text-gray-600 text-sm transition-all duration-300 ease-in-out ${open === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
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