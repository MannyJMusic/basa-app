import { ExternalLink, MapPin } from 'lucide-react'
import { EventImage } from '@/components/events/event-image'

export interface VenueMapProps {
  name: string
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  latitude?: number | null
  longitude?: number | null
  image?: string | null
  website?: string | null
}

/** The query a map understands: coordinates when known, else the full address. */
export function mapQuery(v: Pick<VenueMapProps, 'name' | 'address' | 'city' | 'state' | 'zipCode' | 'latitude' | 'longitude'>): string {
  if (v.latitude != null && v.longitude != null) return `${v.latitude},${v.longitude}`
  const street = [v.address, v.city, v.state, v.zipCode].filter(Boolean).join(', ')
  return street ? `${v.name}, ${street}` : v.name
}

/**
 * Venue details with an embedded map. The keyless Google Maps embed is used
 * (https://www.google.com/maps?q=…&output=embed), so no API key is needed; the
 * vhost's CSP must allow https://www.google.com in frame-src.
 */
export function VenueMap(v: VenueMapProps) {
  const q = encodeURIComponent(mapQuery(v))
  const line = [v.address, [v.city, v.state, v.zipCode].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <EventImage src={v.image} alt={`${v.name} logo`} variant="full" className="h-16 w-16 shrink-0 rounded-md border bg-white object-contain" />
        <div className="text-gray-700">
          <p className="font-medium">{v.name}</p>
          {line && <p className="flex items-start text-sm"><MapPin className="mr-1 mt-0.5 h-4 w-4 shrink-0" />{line}</p>}
          <div className="mt-1 flex flex-wrap gap-x-4 text-sm">
            <a className="inline-flex items-center text-purple-700 hover:underline" href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener noreferrer">
              Get directions <ExternalLink className="ml-1 h-3 w-3" />
            </a>
            {v.website && (
              <a className="inline-flex items-center text-purple-700 hover:underline" href={v.website} target="_blank" rel="noopener noreferrer">
                Website <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
      {line && (
        <iframe
          title={`Map of ${v.name}`}
          src={`https://www.google.com/maps?q=${q}&output=embed`}
          className="h-64 w-full rounded-md border"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  )
}
