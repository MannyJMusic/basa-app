import React from "react";
import Link from "next/link";

const MembershipHero = () => {
  return (
    <section className="relative w-full h-[420px] flex items-center justify-center overflow-hidden">
      {/* Background image placeholder (replace with Next.js Image for production) */}
      <div className="absolute inset-0 bg-[url('/images/backgrounds/basa-skyline.jpg')] bg-cover bg-center" aria-hidden="true" />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-sans">
          Choose Your Path to Business Success in San Antonio
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 mb-8 font-sans">
          Join 150+ businesses across Stone Oak, Center of City, and Southside chapters
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="#chapter-memberships" className="w-full sm:w-auto py-3 px-8 rounded-lg font-semibold text-lg transition-colors shadow-lg text-center bg-blue-900 text-white hover:bg-blue-800 focus:ring-2 focus:ring-blue-400">
            Chapter Membership
          </Link>
          <Link href="#resource-memberships" className="w-full sm:w-auto py-3 px-8 rounded-lg font-semibold text-lg transition-colors shadow-lg text-center bg-amber-500 text-white hover:bg-amber-600 focus:ring-2 focus:ring-amber-300">
            Resource Membership
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MembershipHero; 