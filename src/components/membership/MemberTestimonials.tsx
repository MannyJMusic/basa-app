import React from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Johnson",
    type: "Meeting Member",
    business: "Marketing Consultant",
    img: "/images/profile/2.png", // Numbered headshot
    quote:
      "BASA's Meeting Membership opened doors to new clients and partnerships. The networking events are invaluable!"
  },
  {
    name: "Michael Chen",
    type: "Associate Member",
    business: "Real Estate Developer",
    img: "/images/profile/3.png",
    quote:
      "The Associate tier's social media perks and e-blasts have boosted my business's visibility in San Antonio."
  },
  {
    name: "Lisa Martinez",
    type: "TRIO Member",
    business: "Tech Startup Founder",
    img: "/images/profile/4.png",
    quote:
      "TRIO Membership gave me access to all chapters—my network tripled and so did my opportunities!"
  },
  {
    name: "Carlos Rivera",
    type: "Class Resource Member",
    business: "Digital Marketing Agency",
    img: "/images/profile/5.png",
    quote:
      "The resource membership is perfect for my remote team. We get all the digital perks and still feel part of the BASA community."
  },
  {
    name: "Emily Nguyen",
    type: "NAG Resource Member",
    business: "Nonprofit Director",
    img: "/images/profile/6.png",
    quote:
      "NAG Resource Membership is a fantastic value. I love the giving-back focus and the included benefits."
  },
  {
    name: "David Lee",
    type: "Training Resource Member",
    business: "Business Coach",
    img: "/images/profile/7.png",
    quote:
      "The guaranteed training seat and chance to be a panelist made the Training Resource Membership a no-brainer for me."
  }
];

const MemberTestimonials = () => {
  return (
    <section className="py-20 bg-gray-50" id="testimonials">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Members Say</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Hear from San Antonio business owners and professionals about their BASA experience.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((t, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl shadow-lg p-8 flex flex-col items-center text-center transition-transform hover:scale-105">
            <Image
              src={t.img}
              alt={`Headshot of ${t.name}`}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-blue-100 shadow"
              loading="lazy"
            />
            <div className="font-semibold text-lg text-gray-900 mb-1">{t.name}</div>
            <div className="text-sm text-blue-700 font-medium mb-1">{t.type}</div>
            <div className="text-xs text-gray-500 mb-4">{t.business}</div>
            <blockquote className="italic text-gray-700">“{t.quote}”</blockquote>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MemberTestimonials; 