import ContactForm from "@/components/forms/contact-form"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-basa-navy via-white to-basa-teal">
      {/* Contact Form Section */}
      <section id="contact-form" className="relative py-20">
        <div className="basa-container">
          <ContactForm />
        </div>
      </section>
    </div>
  )
} 