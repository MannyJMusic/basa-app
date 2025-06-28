import React from 'react';

interface GuestOverlayProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  signInText?: string;
  signInLink?: string;
  className?: string;
}

export function GuestOverlay({
  title = "Unlock the Power of the BASA Network!",
  description = "You're just one step away from exclusive access! Join BASA as a member to connect with top business leaders, view full profiles, and unlock premium networking opportunities, events, and resources.",
  ctaText = "Become a Member",
  ctaLink = "/membership/join",
  signInText = "Already a member? Sign in here",
  signInLink = "/auth/sign-in",
  className = ""
}: GuestOverlayProps) {
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center z-50 border-4 border-blue-400 rounded-2xl ${className}`} 
         style={{ background: 'linear-gradient(135deg, rgba(191,219,254,0.7) 0%, rgba(221,214,254,0.7) 100%)' }}>
      <div className="bg-white/90 border-2 border-blue-400 rounded-2xl p-10 shadow-2xl text-center max-w-lg">
        <h2 className="text-3xl font-extrabold mb-4 text-blue-800 drop-shadow">{title}</h2>
        <p className="text-lg text-gray-800 mb-4 font-semibold">
          <span className="text-purple-700">{description.split('!')[0]}!</span><br />
          <span className="text-blue-700">{description.split('!')[1]}</span>
        </p>
        <a href={ctaLink} className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 hover:from-purple-600 hover:to-blue-600 transition-transform duration-200">
          {ctaText} &rarr;
        </a>
        <p className="mt-4 text-sm text-gray-600">
          {signInText} <a href={signInLink} className="underline text-blue-700">Sign in here</a>.
        </p>
      </div>
    </div>
  );
} 