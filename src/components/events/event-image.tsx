'use client'

import { useState } from 'react'
import { thumbnailUrl } from '@/lib/event-image'

interface EventImageProps {
  src?: string | null
  alt: string
  /** `thumb` uses the stored thumbnail when there is one; `full` always the original. */
  variant?: 'thumb' | 'full'
  className?: string
}

/**
 * An event's featured image (the flyer). Plain <img>: /uploads is served by nginx
 * and the optimizer cannot see files added after Next started. Falls back from the
 * thumbnail to the original, and renders nothing if both fail.
 */
export function EventImage({ src, alt, variant = 'thumb', className }: EventImageProps) {
  const thumb = variant === 'thumb' ? thumbnailUrl(src) : null
  const [current, setCurrent] = useState(thumb ?? src ?? null)
  const [failed, setFailed] = useState(false)
  if (!current || failed) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => {
        if (src && current !== src) setCurrent(src)
        else setFailed(true)
      }}
    />
  )
}
