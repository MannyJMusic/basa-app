import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export interface CreateMemberData {
  // User fields
  firstName?: string
  lastName?: string
  email: string
  password?: string
  role?: string
  
  // Member fields
  businessName?: string
  businessType?: string
  industry?: string[]
  businessEmail?: string
  businessPhone?: string
  businessAddress?: string
  city?: string
  state?: string
  zipCode?: string
  website?: string
  membershipTier?: string
  membershipStatus?: string
  description?: string
  tagline?: string
  specialties?: string[]
  certifications?: string[]
  showInDirectory?: boolean
  allowContact?: boolean
  showAddress?: boolean
  newsletterSubscribed?: boolean
  membershipPaymentConfirmed?: boolean
}

export async function createMemberWithUser(data: CreateMemberData) {
  return await db.$transaction(async (tx) => {
    // Check if user already exists
    let user = await tx.user.findUnique({
      where: { email: data.email }
    })

    // Create user if it doesn't exist
    if (!user) {
      const hashedPassword = data.password ? await bcrypt.hash(data.password, 12) : null
      
      user = await tx.user.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          hashedPassword,
          role: data.role || 'MEMBER',
          isActive: true,
          accountStatus: 'ACTIVE',
        }
      })
    }

    // Check if member already exists for this user
    const existingMember = await tx.member.findUnique({
      where: { userId: user.id }
    })

    if (existingMember) {
      throw new Error('Member already exists for this user')
    }

    // Create member record
    const member = await tx.member.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        businessType: data.businessType,
        industry: data.industry || [],
        businessEmail: data.businessEmail,
        businessPhone: data.businessPhone,
        businessAddress: data.businessAddress,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        website: data.website,
        membershipTier: data.membershipTier as any,
        membershipStatus: (data.membershipStatus as any) || 'PENDING',
        description: data.description,
        tagline: data.tagline,
        specialties: data.specialties || [],
        certifications: data.certifications || [],
        showInDirectory: data.showInDirectory ?? true,
        allowContact: data.allowContact ?? true,
        showAddress: data.showAddress ?? false,
        newsletterSubscribed: data.newsletterSubscribed ?? false,
        membershipPaymentConfirmed: data.membershipPaymentConfirmed ?? false,
      }
    })

    return { user, member }
  })
}

export async function updateMemberWithUser(memberId: string, data: Partial<CreateMemberData>) {
  return await db.$transaction(async (tx) => {
    // Get existing member
    const existingMember = await tx.member.findUnique({
      where: { id: memberId },
      include: { user: true }
    })

    if (!existingMember) {
      throw new Error('Member not found')
    }

    // Update user if user fields are provided
    if (data.firstName || data.lastName || data.email || data.role) {
      await tx.user.update({
        where: { id: existingMember.userId },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.email && { email: data.email }),
          ...(data.role && { role: data.role }),
        }
      })
    }

    // Update member
    const member = await tx.member.update({
      where: { id: memberId },
      data: {
        ...(data.businessName && { businessName: data.businessName }),
        ...(data.businessType && { businessType: data.businessType }),
        ...(data.industry && { industry: data.industry }),
        ...(data.businessEmail && { businessEmail: data.businessEmail }),
        ...(data.businessPhone && { businessPhone: data.businessPhone }),
        ...(data.businessAddress && { businessAddress: data.businessAddress }),
        ...(data.city && { city: data.city }),
        ...(data.state && { state: data.state }),
        ...(data.zipCode && { zipCode: data.zipCode }),
        ...(data.website && { website: data.website }),
        ...(data.membershipTier && { membershipTier: data.membershipTier as any }),
        ...(data.membershipStatus && { membershipStatus: data.membershipStatus as any }),
        ...(data.description && { description: data.description }),
        ...(data.tagline && { tagline: data.tagline }),
        ...(data.specialties && { specialties: data.specialties }),
        ...(data.certifications && { certifications: data.certifications }),
        ...(data.showInDirectory !== undefined && { showInDirectory: data.showInDirectory }),
        ...(data.allowContact !== undefined && { allowContact: data.allowContact }),
        ...(data.showAddress !== undefined && { showAddress: data.showAddress }),
        ...(data.newsletterSubscribed !== undefined && { newsletterSubscribed: data.newsletterSubscribed }),
        ...(data.membershipPaymentConfirmed !== undefined && { membershipPaymentConfirmed: data.membershipPaymentConfirmed }),
      }
    })

    return member
  })
} 