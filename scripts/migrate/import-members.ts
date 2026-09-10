/**
 * Import PMPro members, their chapters and their membership history (#58).
 *
 *   pnpm migrate:members            # dry run against the newest dump
 *   pnpm migrate:members --commit   # actually write
 *
 * This is a smaller job than "migrate the membership base" suggests. Across 314
 * PMPro rows there are 140 people, 296 expired memberships, and 14 active rows
 * belonging to 5 users - four of whom are BASA staff accounts with memberships
 * that never expire. There is no paying membership base to move; there is a
 * contact list with history, and the history is the valuable part.
 *
 * Decisions this follows, from #51 and #35:
 *
 *  - Everyone imports as EXPIRED with their legacy tiers recorded for reference.
 *    The few still-current members are placed onto launch tiers by hand, because
 *    Market, Mission and Action have no equivalent in the new product.
 *  - Three live chapters (SS, CC, SO). South Side West is retired but still has
 *    to be representable, so it is created inactive.
 *  - 86 of the 140 held levels in more than one chapter. Member.chapterId takes
 *    the most recent one; the rest live in LegacyMembership.
 *  - The importer never sends email, and imports no credentials.
 */
import { PrismaClient, Prisma, Status, AccountStatus } from '@prisma/client'
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { scanDump, Row } from './lib/mysqldump'
import { decodeEntities, collapseWhitespace } from './lib/text'
import { wallClockToUtc } from './lib/timezone'
import { MigrationReport, parseArgs } from './lib/report'
import { LAUNCH_CHAPTERS } from '../../src/lib/membership-tiers'

const prisma = new PrismaClient()

/**
 * PMPro group name to basa-app chapter code. The database names are not the ones
 * the association uses, and the level names cannot be parsed instead: level 27 is
 * "SS w Associate" with a lowercase w, and "SS W" has to be tested before "SS".
 */
const CHAPTER_BY_GROUP: Record<string, { code: string; name: string; active: boolean }> = {
  'South Side2East': { code: 'SS', name: 'South Side East', active: true },
  'Center of The City': { code: 'CC', name: 'Center of the City', active: true },
  'Stone Oak': { code: 'SO', name: 'Stone Oak', active: true },
  'South Side2West': { code: 'SSW', name: 'South Side West', active: false },
}

/** The retired chapter, kept representable so its three members can be attached. */
const RETIRED_CHAPTERS = [{ code: 'SSW', name: 'South Side West', displayOrder: 4 }]

interface Options {
  dumpPath: string
  commit: boolean
}

function newestDump(): string {
  const dir = join(process.cwd(), 'backups', 'mysql')
  if (!existsSync(dir)) throw new Error(`no dump given and ${dir} does not exist - run scripts/pull-backups.sh`)
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql.gz')).sort()
  if (!files.length) throw new Error(`no *.sql.gz in ${dir} - run scripts/pull-backups.sh`)
  return join(dir, files[files.length - 1])
}

function readOptions(): Options {
  const { flags, values } = parseArgs(process.argv.slice(2))
  return { dumpPath: values.dump ?? newestDump(), commit: flags.has('commit') }
}

interface PmProSource {
  users: Map<number, Row>
  usermeta: Map<number, Record<string, string>>
  levels: Map<number, Row>
  chapterCodeByLevel: Map<number, string>
  memberships: Row[]
}

const num = (v: string | null | undefined): number => (v == null ? 0 : parseInt(v, 10) || 0)

async function loadPmPro(dumpPath: string, report: MigrationReport): Promise<PmProSource> {
  const users = new Map<number, Row>()
  const levels = new Map<number, Row>()
  const groups = new Map<number, string>()
  const levelGroup = new Map<number, number>()
  const memberships: Row[] = []

  await scanDump(dumpPath, {
    wp_users: (r) => users.set(num(r.ID), r),
    wp_pmpro_membership_levels: (r) => levels.set(num(r.id), r),
    wp_pmpro_groups: (r) => groups.set(num(r.id), r.name ?? ''),
    wp_pmpro_membership_levels_groups: (r) => levelGroup.set(num(r.level), num(r.group)),
    wp_pmpro_memberships_users: (r) => memberships.push(r),
  })

  const chapterCodeByLevel = new Map<number, string>()
  levelGroup.forEach((groupId, levelId) => {
    const groupName = groups.get(groupId)
    const chapter = groupName ? CHAPTER_BY_GROUP[groupName] : undefined
    if (!chapter) {
      report.issue('PMPro level belongs to a group with no chapter mapping',
        `level ${levelId} -> group ${groupId} "${groupName ?? 'missing'}"`)
      return
    }
    chapterCodeByLevel.set(levelId, chapter.code)
  })

  // Only the members' meta is worth holding; wp_usermeta is most of the dump.
  const memberIds = new Set(memberships.map((m) => num(m.user_id)))
  const usermeta = new Map<number, Record<string, string>>()
  await scanDump(dumpPath, {
    wp_usermeta: (r) => {
      const userId = num(r.user_id)
      if (!memberIds.has(userId)) return
      const existing = usermeta.get(userId) ?? {}
      existing[r.meta_key ?? ''] = r.meta_value ?? ''
      usermeta.set(userId, existing)
    },
  })

  return { users, usermeta, levels, chapterCodeByLevel, memberships }
}

/**
 * Business details, assembled from the three places WordPress kept them: PeepSo
 * profile fields (numbered, because the labels live in `peepso_user_field` posts),
 * WooCommerce billing fields, and PMPro's own billing fields.
 */
function profileOf(meta: Record<string, string>): {
  firstName: string | null
  lastName: string | null
  businessName: string | null
  businessPhone: string | null
  businessEmail: string | null
  businessAddress: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  website: string | null
  description: string | null
} {
  const pick = (...keys: string[]): string | null => {
    for (const key of keys) {
      const value = collapseWhitespace(decodeEntities(meta[key] ?? ''))
      if (value) return value
    }
    return null
  }

  return {
    firstName: pick('first_name', 'billing_first_name', 'pmpro_bfirstname'),
    lastName: pick('last_name', 'billing_last_name', 'pmpro_blastname'),
    // PeepSo field 103 is "Main Company"; nothing filled in billing_company.
    businessName: pick('peepso_user_field_103'),
    businessPhone: pick('peepso_user_field_104', 'billing_phone', 'pmpro_bphone'),
    businessEmail: pick('peepso_user_field_105', 'billing_email', 'pmpro_bemail'),
    businessAddress: pick('peepso_user_field_106', 'billing_address_1', 'pmpro_baddress1'),
    city: pick('billing_city', 'pmpro_bcity'),
    state: pick('peepso_user_field_108', 'billing_state', 'pmpro_bstate'),
    zipCode: pick('peepso_user_field_110', 'billing_postcode', 'pmpro_bzipcode'),
    website: pick('user_url'),
    description: pick('description'),
  }
}

/**
 * PMPro writes `2023-05-14 00:00:00` with no offset - local wall clock, same as
 * MEC. Reading it as UTC would move a midnight expiry back to 7pm the previous
 * day once it is rendered in Central, which is the wrong day for a renewal date.
 */
function parseWpDate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(value ?? '')
  if (!match || match[1] === '0000') return null
  return wallClockToUtc(
    parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10),
    parseInt(match[4] ?? '0', 10), parseInt(match[5] ?? '0', 10)
  )
}

function changedFields(existing: Record<string, unknown>, desired: Record<string, unknown>): string[] {
  const changed: string[] = []
  for (const key of Object.keys(desired)) {
    const before = existing[key]
    const after = desired[key]
    if (before instanceof Date || after instanceof Date) {
      const b = before instanceof Date ? before.getTime() : null
      const a = after instanceof Date ? after.getTime() : null
      if (b !== a) changed.push(key)
      continue
    }
    if (before instanceof Prisma.Decimal || after instanceof Prisma.Decimal) {
      const b = before === null || before === undefined ? null : Number(before)
      const a = after === null || after === undefined ? null : Number(after)
      if (b !== a) changed.push(key)
      continue
    }
    if ((before ?? null) !== (after ?? null)) changed.push(key)
  }
  return changed
}

async function ensureChapters(report: MigrationReport, opts: Options): Promise<Map<string, string>> {
  const idByCode = new Map<string, string>()
  const all = [
    ...LAUNCH_CHAPTERS.map((c) => ({ ...c, isActive: true })),
    ...RETIRED_CHAPTERS.map((c) => ({ ...c, isActive: false })),
  ]

  for (const chapter of all) {
    const existing = await prisma.chapter.findUnique({ where: { code: chapter.code } })
    if (!existing) {
      report.tally('chapters', 'created')
      if (opts.commit) {
        const created = await prisma.chapter.create({ data: chapter })
        idByCode.set(chapter.code, created.id)
      }
      continue
    }
    idByCode.set(chapter.code, existing.id)
    // Only the retired flag is this importer's business; names belong to the seed.
    if (existing.isActive !== chapter.isActive) {
      report.tally('chapters', 'updated')
      if (opts.commit) await prisma.chapter.update({ where: { id: existing.id }, data: { isActive: chapter.isActive } })
    } else {
      report.tally('chapters', 'unchanged')
    }
  }
  return idByCode
}

interface MembershipRow {
  wpId: number
  levelId: number
  levelName: string
  chapterCode: string | null
  price: number
  status: string
  startedAt: Date | null
  endedAt: Date | null
}

async function importMembers(src: PmProSource, chapterIds: Map<string, string>, report: MigrationReport, opts: Options): Promise<void> {
  const byUser = new Map<number, MembershipRow[]>()
  for (const row of src.memberships) {
    const userId = num(row.user_id)
    const levelId = num(row.membership_id)
    const level = src.levels.get(levelId)
    if (!level) {
      report.issue('membership points at a level that no longer exists', `wp row ${row.id}, level ${levelId}`)
      continue
    }
    const list = byUser.get(userId) ?? []
    list.push({
      wpId: num(row.id),
      levelId,
      levelName: collapseWhitespace(decodeEntities(level.name ?? '')),
      chapterCode: src.chapterCodeByLevel.get(levelId) ?? null,
      price: parseFloat(row.initial_payment ?? '0') || 0,
      status: row.status ?? 'unknown',
      startedAt: parseWpDate(row.startdate),
      endedAt: parseWpDate(row.enddate),
    })
    byUser.set(userId, list)
  }

  let stillActive = 0
  let multiChapter = 0
  const emails = new Map<string, number>()
  const byPrimaryChapter = new Map<string, number>()
  const byLegacyTier = new Map<string, number>()
  const byLegacyStatus = new Map<string, number>()

  const bump = (map: Map<string, number>, key: string): void => {
    map.set(key, (map.get(key) ?? 0) + 1)
  }

  for (const userId of Array.from(byUser.keys()).sort((a, b) => a - b)) {
    const history = byUser.get(userId)!
    const wpUser = src.users.get(userId)
    if (!wpUser) {
      report.tally('members', 'skipped')
      report.issue('membership belongs to a user that is not in the dump', `wp user ${userId}`)
      continue
    }

    const email = collapseWhitespace(wpUser.user_email ?? '').toLowerCase()
    if (!email) {
      report.tally('members', 'skipped')
      report.issue('user has no email address', `wp user ${userId} (${wpUser.user_login})`)
      continue
    }
    const duplicate = emails.get(email)
    if (duplicate !== undefined) {
      report.tally('members', 'skipped')
      report.issue('two WordPress users share an email address', `${email}: wp users ${duplicate} and ${userId}`)
      continue
    }
    emails.set(email, userId)

    const profile = profileOf(src.usermeta.get(userId) ?? {})
    const displayName = collapseWhitespace(decodeEntities(wpUser.display_name ?? '')) || null
    const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || displayName

    // Most recent membership wins the single chapter slot; the rest are history.
    const sorted = history.slice().sort((a, b) => (b.startedAt?.getTime() ?? 0) - (a.startedAt?.getTime() ?? 0))
    const chapters = new Set(history.map((h) => h.chapterCode).filter(Boolean))
    if (chapters.size > 1) multiChapter++
    const primaryChapter = sorted.filter((h) => h.chapterCode)[0]?.chapterCode ?? null
    if (history.some((h) => h.status === 'active')) stillActive++

    bump(byPrimaryChapter, primaryChapter ?? 'none')
    for (const row of history) {
      // "SO Meeting Membership - Annual" is the same tier as "SS Meeting ...".
      bump(byLegacyTier, row.levelName.replace(/^\S+\s+(w\s+)?/i, '').replace(/ Membership - Annual$/, ''))
      bump(byLegacyStatus, row.status)
    }

    // Every legacy member imports as EXPIRED (#51). renewalDate carries the last
    // expiry there was, so the lifecycle in #52 has something true to work from.
    const endings = history.map((h) => h.endedAt).filter((d): d is Date => !!d)
    const renewalDate = endings.length
      ? new Date(Math.max.apply(null, endings.map((d) => d.getTime())))
      : null
    const joinedAt = history
      .map((h) => h.startedAt)
      .filter((d): d is Date => !!d)
      .sort((a, b) => a.getTime() - b.getTime())[0]
      ?? parseWpDate(wpUser.user_registered)
      ?? new Date()

    const chapterId = primaryChapter ? chapterIds.get(primaryChapter) ?? null : null
    const memberFields = {
      businessName: profile.businessName,
      businessEmail: profile.businessEmail,
      businessPhone: profile.businessPhone,
      businessAddress: profile.businessAddress,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      website: profile.website,
      description: profile.description,
      membershipTier: null,
      membershipStatus: Status.EXPIRED,
      renewalDate,
      joinedAt,
      // A lapsed contact is not a listing. Whoever renews gets to opt back in.
      showInDirectory: false,
      newsletterSubscribed: false,
    }

    const existingMember = await prisma.member.findUnique({ where: { wpUserId: userId } })

    if (!existingMember) {
      // An email already in basa-app is somebody's real account - a seeded admin,
      // or a guest ticket buyer. Never write over one from an import.
      const emailOwner = await prisma.user.findUnique({ where: { email }, include: { member: true } })
      if (emailOwner) {
        report.tally('members', 'skipped')
        report.issue('email already belongs to a basa-app account', `${email} (wp user ${userId}, role ${emailOwner.role})`)
        continue
      }

      report.tally('members', 'created')
      if (opts.commit) {
        const created = await prisma.member.create({
          data: {
            ...memberFields,
            wpUserId: userId,
            chapter: chapterId ? { connect: { id: chapterId } } : undefined,
            user: {
              create: {
                email,
                name,
                firstName: profile.firstName,
                lastName: profile.lastName,
                // No credentials come over: WordPress hashes are phpass and
                // basa-app uses bcrypt. These accounts are claimed, not logged into.
                hashedPassword: null,
                role: 'GUEST',
                isActive: false,
                accountStatus: AccountStatus.INACTIVE,
              },
            },
          },
        })
        await syncHistory(created.id, history, report, opts)
      } else {
        history.forEach(() => report.tally('legacy memberships', 'created'))
      }
      continue
    }

    const changed = changedFields(existingMember as unknown as Record<string, unknown>, { ...memberFields, chapterId })
    if (changed.length) {
      report.tally('members', 'updated')
      if (opts.commit) await prisma.member.update({ where: { id: existingMember.id }, data: { ...memberFields, chapterId } })
    } else {
      report.tally('members', 'unchanged')
    }
    await syncHistory(existingMember.id, history, report, opts)
  }

  const sortedRows = (map: Map<string, number>): [string, number][] =>
    Array.from(map.entries()).sort((a, b) => b[1] - a[1])

  report.breakdown('Members by primary chapter', sortedRows(byPrimaryChapter))
  report.breakdown('Legacy memberships by tier (all chapters)', sortedRows(byLegacyTier))
  report.breakdown('Legacy memberships by PMPro status', sortedRows(byLegacyStatus))

  report.note(
    `${stillActive} of ${byUser.size} people have a membership PMPro still calls active, and they import as ` +
    `EXPIRED like everyone else (#51). Four of them are BASA staff accounts whose memberships never had an end date. ` +
    `Placing anyone onto a launch tier is a per-member decision, so no membershipTier is set by this import.`
  )
  report.note(
    `${multiChapter} people held levels in more than one chapter. Member.chapterId gets the most recent one; ` +
    `every chapter they held is in LegacyMembership.`
  )
  report.note(
    'No credentials imported and no email sent. Imported accounts have no password, are INACTIVE, and need a ' +
    'claim or reset flow before anyone can sign in.'
  )
  report.note('Imported members are hidden from the directory: they are lapsed contacts, not current listings.')
}

async function syncHistory(memberId: string, history: MembershipRow[], report: MigrationReport, opts: Options): Promise<void> {
  for (const row of history) {
    const desired = {
      wpLevelId: row.levelId,
      levelName: row.levelName,
      chapterCode: row.chapterCode,
      price: new Prisma.Decimal(row.price),
      status: row.status,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
    }
    const existing = await prisma.legacyMembership.findUnique({ where: { wpId: row.wpId } })
    if (!existing) {
      report.tally('legacy memberships', 'created')
      if (opts.commit) await prisma.legacyMembership.create({ data: { ...desired, wpId: row.wpId, memberId } })
      continue
    }
    if (changedFields(existing as unknown as Record<string, unknown>, desired).length) {
      report.tally('legacy memberships', 'updated')
      if (opts.commit) await prisma.legacyMembership.update({ where: { id: existing.id }, data: desired })
    } else {
      report.tally('legacy memberships', 'unchanged')
    }
  }
}

async function main(): Promise<void> {
  const opts = readOptions()
  const report = new MigrationReport('PMPro members, chapters and membership history (#58)', !opts.commit)

  console.log(`Reading ${opts.dumpPath}`)
  const src = await loadPmPro(opts.dumpPath, report)
  console.log(`  ${src.memberships.length} PMPro membership rows, ${src.levels.size} levels, ${src.users.size} WordPress users`)

  const chapterIds = await ensureChapters(report, opts)
  await importMembers(src, chapterIds, report, opts)

  report.print()
  if (!opts.commit) console.log('Nothing was written. Re-run with --commit to apply.\n')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
