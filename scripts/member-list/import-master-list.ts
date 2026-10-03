/**
 * Loads the office's member master list into the site (2026 relaunch).
 *
 *   tsx scripts/member-list/import-master-list.ts --file=list.csv                    # dry run
 *   tsx scripts/member-list/import-master-list.ts --file=list.csv --commit           # write
 *   tsx scripts/member-list/import-master-list.ts --file=list.csv --commit --expire-unlisted
 *
 * The CSV is the spreadsheet saved with columns BUSINESS NAME, Membership, EMAILS,
 * Expires, Contact (see parse.ts). It holds member PII: keep it out of the repo.
 *
 * What it does, per listed contact:
 *  - Existing account (matched by email, any case): membership set ACTIVE at the
 *    listed level and expiry; role GUEST becomes MEMBER; the business name is filled
 *    only when the record has none. Password and sign-in state are untouched; on an
 *    account never signed in to, directory settings follow the rule for new contacts.
 *  - New contact: an account in the claim state imported members use (no password,
 *    INACTIVE), role MEMBER, so the admin invitations page can send a set-password
 *    link later. Directory: the business's first contact is listed; contact details
 *    stay hidden (allowContact/showAddress false) until the member or office opts in.
 *  - With --expire-unlisted: ACTIVE members not on the list (admins excluded) become
 *    EXPIRED. Their accounts and history are kept.
 *
 * It sends no email. Every change is audit-logged under the system principal.
 */
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { PrismaClient, Prisma } from '@prisma/client'
import { parseMemberList, type ListRow, type ParsedMember } from './parse'
import { MEMBERSHIP_TIERS } from '../../src/lib/membership-tiers'

const prisma = new PrismaClient()
const SYSTEM_EMAIL = 'system@businessassociationsa.invalid'

function args() {
  const out: Record<string, string | true> = {}
  for (const a of process.argv.slice(2)) {
    if (!a.startsWith('--')) continue
    const [k, v] = a.slice(2).split('=')
    out[k] = v ?? true
  }
  return out
}

function readRows(file: string): ListRow[] {
  const records: string[][] = parse(readFileSync(file, 'utf8'), { relax_column_count: true, skip_empty_lines: false })
  const header = (records[0] ?? []).map((h) => h.trim().toLowerCase())
  const col = (name: string) => header.findIndex((h) => h.replace(/\s+/g, ' ').includes(name))
  const ix = { business: col('business'), membership: col('membership'), email: col('email'), expires: col('expires'), contact: col('contact') }
  if (Object.values(ix).some((i) => i < 0)) throw new Error(`CSV needs columns BUSINESS NAME, Membership, EMAILS, Expires, Contact; got: ${records[0]?.join(', ')}`)
  return records.slice(1).map((r, i) => ({
    row: i + 2,
    business: r[ix.business] ?? '',
    membership: r[ix.membership] ?? '',
    email: r[ix.email] ?? '',
    expires: r[ix.expires] ?? '',
    contact: r[ix.contact] ?? '',
  }))
}

const fmt = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : 'none')

async function main() {
  const a = args()
  if (typeof a.file !== 'string') throw new Error('Pass --file=path/to/list.csv')
  const commit = a.commit === true
  const expireUnlisted = a['expire-unlisted'] === true

  const rows = readRows(a.file)
  const { members, skipped } = parseMemberList(rows)
  // The audit principal, created the way src/lib/system-user.ts does: inactive,
  // no password, not an admin, and refused by sign-in.
  const system = commit
    ? await prisma.user.upsert({
        where: { email: SYSTEM_EMAIL },
        update: {},
        create: { email: SYSTEM_EMAIL, firstName: 'System', lastName: 'User', name: 'System User', role: 'GUEST', isActive: false, accountStatus: 'INACTIVE', hashedPassword: null },
        select: { id: true },
      })
    : null

  const now = new Date()
  const report = { created: 0, updated: 0, unchanged: 0, expired: 0 }
  const notes: string[] = []

  for (const m of members) {
    const renewalDate = m.billing.kind === 'yearly' ? m.billing.renewalDate : null
    if (m.billing.kind === 'monthly') notes.push(`row ${m.row} ${m.business}: billed monthly, no renewal date set (never auto-expires)`)
    if (m.billing.kind === 'unknown') notes.push(`row ${m.row} ${m.business}: no expiry on the list, no renewal date set`)
    if (renewalDate && renewalDate < now) notes.push(`row ${m.row} ${m.business}: listed expiry ${fmt(renewalDate)} has passed; the nightly sweep will expire it unless the date is updated`)

    const user = await prisma.user.findFirst({
      where: { email: { equals: m.email, mode: 'insensitive' } },
      include: { member: true },
    })

    if (!user) {
      report.created++
      if (commit) await createMember(m, renewalDate, system!.id)
      continue
    }
    if (user.role === 'ADMIN') notes.push(`row ${m.row} ${m.business}: email belongs to an admin account; membership set, role kept`)

    const member = user.member
    const same = member && member.membershipStatus === 'ACTIVE' && member.membershipTier === m.tier &&
      (member.renewalDate?.getTime() ?? null) === (renewalDate?.getTime() ?? null) &&
      (user.hashedPassword !== null || (member.showInDirectory === m.primary && !member.allowContact))
    if (same && user.role !== 'GUEST') { report.unchanged++; continue }
    report.updated++
    if (commit) await updateMember(user.id, member, m, renewalDate, user.role, user.hashedPassword === null, system!.id)
  }

  if (expireUnlisted) {
    // Anyone on the list at all, including rows held for the office, is not expired.
    const listed = new Set(rows.map((r) => r.email.trim().toLowerCase()).filter(Boolean))
    const active = await prisma.member.findMany({
      where: { membershipStatus: 'ACTIVE', user: { role: { not: 'ADMIN' } } },
      select: { id: true, businessName: true, user: { select: { email: true } } },
    })
    const unlisted = active.filter((x) => !x.user.email || !listed.has(x.user.email.toLowerCase()))
    report.expired = unlisted.length
    for (const x of unlisted) {
      notes.push(`not on list, ${commit ? 'expired' : 'would expire'}: ${x.businessName ?? '(no business name)'}`)
      if (commit) {
        await prisma.member.update({ where: { id: x.id }, data: { membershipStatus: 'EXPIRED' } })
        await audit(system!.id, 'MEMBER_LIST_EXPIRED', x.id, { reason: 'not on 2026-10-01 master list' })
      }
    }
  }

  console.log(`${commit ? 'COMMITTED' : 'DRY RUN'}: ${members.length} listed contacts`)
  console.log(`  new accounts: ${report.created}, updated: ${report.updated}, unchanged: ${report.unchanged}${expireUnlisted ? `, expired (not on list): ${report.expired}` : ''}`)
  console.log(`  skipped rows needing the office: ${skipped.length}`)
  for (const s of skipped) console.log(`    row ${s.row} ${s.business || '(no business)'}: ${s.reason}`)
  if (notes.length) {
    console.log('  notes:')
    for (const n of notes) console.log(`    ${n}`)
  }
}

async function createMember(m: ParsedMember, renewalDate: Date | null, actorId: string) {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: m.email,
        firstName: m.firstName,
        lastName: m.lastName,
        name: [m.firstName, m.lastName].filter(Boolean).join(' ') || null,
        role: 'MEMBER',
        isActive: false,
        accountStatus: 'INACTIVE',
        member: {
          create: {
            businessName: m.business,
            businessEmail: m.email,
            membershipTier: m.tier,
            membershipStatus: 'ACTIVE',
            renewalDate,
            showInDirectory: m.primary,
            allowContact: false,
            showAddress: false,
          },
        },
      },
      include: { member: true },
    })
    await tx.auditLog.create({
      data: {
        userId: actorId, action: 'MEMBER_LIST_IMPORT', entityType: 'MEMBER', entityId: user.member!.id,
        newValues: { created: true, tier: m.tier, renewalDate: renewalDate?.toISOString() ?? null, listRow: m.row },
      },
    })
  })
}

async function updateMember(
  userId: string,
  member: { id: string; businessName: string | null; membershipStatus: string; membershipTier: string | null; renewalDate: Date | null } | null,
  m: ParsedMember,
  renewalDate: Date | null,
  role: string,
  neverSignedIn: boolean,
  actorId: string,
) {
  await prisma.$transaction(async (tx) => {
    const data: Prisma.MemberUncheckedUpdateInput = { membershipTier: m.tier, membershipStatus: 'ACTIVE', renewalDate }
    let memberId: string
    if (member) {
      if (!member.businessName || member.businessName === 'Temporary Business') data.businessName = m.business
      // Nobody has chosen these settings on an account never signed in to: they are
      // importer defaults, so the same directory rule as new accounts applies.
      if (neverSignedIn) Object.assign(data, { showInDirectory: m.primary, allowContact: false, showAddress: false })
      await tx.member.update({ where: { id: member.id }, data })
      memberId = member.id
    } else {
      const created = await tx.member.create({
        data: { userId, businessName: m.business, businessEmail: m.email, membershipTier: m.tier, membershipStatus: 'ACTIVE', renewalDate, showInDirectory: m.primary, allowContact: false, showAddress: false },
      })
      memberId = created.id
    }
    if (role === 'GUEST') await tx.user.update({ where: { id: userId }, data: { role: 'MEMBER' } })
    await tx.auditLog.create({
      data: {
        userId: actorId, action: 'MEMBER_LIST_IMPORT', entityType: 'MEMBER', entityId: memberId,
        oldValues: member ? { status: member.membershipStatus, tier: member.membershipTier, renewalDate: member.renewalDate?.toISOString() ?? null } : undefined,
        newValues: { status: 'ACTIVE', tier: m.tier, tierLabel: MEMBERSHIP_TIERS[m.tier].label, renewalDate: renewalDate?.toISOString() ?? null, listRow: m.row },
      },
    })
  })
}

async function audit(actorId: string, action: string, entityId: string, newValues: Record<string, unknown>) {
  await prisma.auditLog.create({ data: { userId: actorId, action, entityType: 'MEMBER', entityId, newValues: newValues as Prisma.InputJsonValue } })
}

main()
  .catch((e) => { console.error(e instanceof Error ? e.message : e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
