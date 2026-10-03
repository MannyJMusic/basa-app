import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireAdmin, isResponse } from '@/lib/api-auth'
import { MEMBERSHIP_TIERS, MEMBERSHIP_TIER_VALUES } from '@/lib/membership-tiers'

/**
 * Staff add a member they already have on their books (office-billed, paid by
 * cash/check/card at the office, or renewing outside the website).
 *
 * The account is created in the same claim state imported members are in: no
 * password, `isActive: false`, `accountStatus: INACTIVE`. Nothing is emailed here;
 * the member gets a set-password link when staff send it from
 * /admin/members/invitations. A payment row is written only when staff say a
 * payment was received, and no card is charged from this route.
 */
const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform(v => (v ? v : undefined))

const bodySchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(254),
  businessName: optionalText(200),
  phone: optionalText(50),
  membershipTier: z.enum(MEMBERSHIP_TIER_VALUES, { errorMap: () => ({ message: 'Choose a membership tier' }) }),
  membershipStatus: z.enum(['PENDING', 'ACTIVE', 'EXPIRED', 'INACTIVE']).default('ACTIVE'),
  /** ISO date or yyyy-mm-dd; defaults to one year from today. */
  renewalDate: z.string().trim().optional().refine(v => !v || !Number.isNaN(new Date(v).getTime()), 'Invalid renewal date'),
  payment: z
    .object({
      amountCents: z.number().int().min(1, 'Payment amount must be more than zero').max(10_000_000),
      method: z.enum(['CASH', 'CHECK', 'CREDIT_CARD', 'BANK_TRANSFER']),
      reference: optionalText(100),
    })
    .optional(),
})


function oneYearFromToday(): Date {
  const d = new Date()
  d.setUTCFullYear(d.getUTCFullYear() + 1)
  d.setUTCHours(12, 0, 0, 0)
  return d
}

function parseRenewalDate(value: string | undefined): Date {
  if (!value) return oneYearFromToday()
  // A bare date from a date input means that calendar day; noon UTC keeps it there in US zones.
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00.000Z`) : new Date(value)
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (isResponse(session)) return session

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Missing required member information' },
      { status: 400 }
    )
  }
  const data = parsed.data
  const renewalDate = parseRenewalDate(data.renewalDate)
  const tier = MEMBERSHIP_TIERS[data.membershipTier]

  try {
    const duplicate = await prisma.user.findFirst({
      where: { email: { equals: data.email, mode: 'insensitive' } },
      select: { id: true },
    })
    if (duplicate) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Search the member list for it and edit that member instead.' },
        { status: 409 }
      )
    }

    const created = await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.firstName} ${data.lastName}`,
          // Same claim state as imported members: they set their own password
          // from an invitation, which also activates the account.
          hashedPassword: null,
          role: data.membershipStatus === 'ACTIVE' ? 'MEMBER' : 'GUEST',
          isActive: false,
          accountStatus: 'INACTIVE',
          member: {
            create: {
              businessName: data.businessName ?? null,
              businessPhone: data.phone ?? null,
              membershipTier: data.membershipTier,
              membershipStatus: data.membershipStatus,
              renewalDate,
              joinedAt: new Date(),
              membershipPaymentConfirmed: !!data.payment,
            },
          },
        },
        include: { member: true },
      })

      const payment = data.payment
        ? await tx.payment.create({
            data: {
              userId: user.id,
              amount: data.payment.amountCents,
              currency: 'usd',
              status: 'COMPLETED',
              paymentMethod: data.payment.method,
              metadata: {
                source: 'admin_recorded',
                recordedBy: session.user.id,
                membershipTier: data.membershipTier,
                tierPriceCents: tier.priceCents,
                ...(data.payment.reference ? { reference: data.payment.reference } : {}),
              },
            },
          })
        : null

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'MEMBER_CREATED_BY_ADMIN',
          entityType: 'MEMBER',
          entityId: user.member!.id,
          newValues: {
            userId: user.id,
            memberId: user.member!.id,
            membershipTier: data.membershipTier,
            membershipStatus: data.membershipStatus,
            renewalDate: renewalDate.toISOString(),
            role: user.role,
            paymentId: payment?.id ?? null,
            paymentAmountCents: payment?.amount ?? null,
            paymentMethod: payment?.paymentMethod ?? null,
          },
        },
      })

      return { user, payment }
    })

    return NextResponse.json(
      {
        success: true,
        member: {
          id: created.user.member!.id,
          userId: created.user.id,
          email: created.user.email,
          firstName: created.user.firstName,
          lastName: created.user.lastName,
          role: created.user.role,
          membershipTier: created.user.member!.membershipTier,
          membershipStatus: created.user.member!.membershipStatus,
          renewalDate: created.user.member!.renewalDate,
        },
        payment: created.payment
          ? { id: created.payment.id, amountCents: created.payment.amount, method: created.payment.paymentMethod }
          : null,
      },
      { status: 201 }
    )
  } catch (error) {
    // Two admins adding the same address at once: the unique index catches the second.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An account with this email already exists. Search the member list for it and edit that member instead.' },
        { status: 409 }
      )
    }
    Sentry.captureException(error)
    console.error('Error adding member:', error)
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
  }
}
