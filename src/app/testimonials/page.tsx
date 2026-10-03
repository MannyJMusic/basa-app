import { permanentRedirect } from 'next/navigation'

// The testimonials and case studies that used to be here were placeholders, not
// real member quotes. Until real ones are collected, send visitors to /about.
export default function TestimonialsPage() {
  permanentRedirect('/about')
}
