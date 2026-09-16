import { PrismaClient } from '@prisma/client'
import { e2eDatabaseUrl } from './env'

/** Prisma against the e2e database, for fixtures and for asserting what the app wrote. */
let client: PrismaClient | null = null
export function db(): PrismaClient {
  if (!client) {
    client = new PrismaClient({ datasources: { db: { url: e2eDatabaseUrl() } } })
  }
  return client
}

/** The event every run registers for. Created by global-setup, always in the future. */
export const FIXTURE_EVENT = {
  slug: 'e2e-networking-mixer',
  title: 'E2E Networking Mixer',
  memberTier: 'Member',
  guestTier: 'Future Member',
  memberPrice: 30,
  guestPrice: 45,
}
