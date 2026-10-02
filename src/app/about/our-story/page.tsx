import { permanentRedirect } from 'next/navigation'

// The previous "Our Story" page described founders and milestones that are not
// BASA's. The real story (founded by Jennifer Bonomo in April 2020) is on /about.
export default function OurStoryPage() {
  permanentRedirect('/about')
}
