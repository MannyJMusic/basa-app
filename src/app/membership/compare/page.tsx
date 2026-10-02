import { permanentRedirect } from 'next/navigation'

/** Old URL (and dashboard link target); the levels page covers it. */
export default function Page() {
  permanentRedirect('/membership#compare')
}
