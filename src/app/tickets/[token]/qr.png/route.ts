import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ticketQrPng, TOKEN_RE } from '@/lib/tickets'

/**
 * The ticket's QR code as a PNG, for the confirmation email: mail clients block
 * inline SVG and data: URIs, but load a plain https image. Only answers for a token
 * that exists, so it cannot be used to mint codes for guessed tokens.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!TOKEN_RE.test(token)) return new NextResponse('Not found', { status: 404 })
  const exists = await prisma.eventRegistration.findUnique({ where: { ticketToken: token }, select: { id: true } })
  if (!exists) return new NextResponse('Not found', { status: 404 })

  const png = await ticketQrPng(token)
  return new NextResponse(new Uint8Array(png), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'private, max-age=86400',
      'x-robots-tag': 'noindex',
    },
  })
}
