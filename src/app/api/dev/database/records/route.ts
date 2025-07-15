import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { table, data } = body

    if (!table || !data) {
      return NextResponse.json(
        { success: false, error: 'Table and data are required' },
        { status: 400 }
      )
    }

    // Map table names to actual Prisma model names
    const tableToModelMap: Record<string, string> = {
      'User': 'user',
      'Member': 'member',
      'Event': 'event',
      'EventRegistration': 'eventRegistration',
      'BlogPost': 'blogPost',
      'Testimonial': 'testimonial',
      'Lead': 'lead',
      'Resource': 'resource',
      'Settings': 'settings',
      'AuditLog': 'auditLog',
    }

    const modelName = tableToModelMap[table]
    if (!modelName) {
      return NextResponse.json(
        { success: false, error: `Unknown table: ${table}` },
        { status: 400 }
      )
    }

    // Special handling for Member records to ensure User relationship
    if (table === 'Member') {
      // If we have a userId, create member for existing user
      if (data.userId) {
        // Check if user exists
        const user = await db.user.findUnique({
          where: { id: data.userId }
        })
        
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          )
        }
        
        // Check if member already exists for this user
        const existingMember = await db.member.findUnique({
          where: { userId: data.userId }
        })
        
        if (existingMember) {
          return NextResponse.json(
            { success: false, error: 'Member already exists for this user' },
            { status: 400 }
          )
        }
        
        // Create member record
        const member = await db.member.create({
          data: {
            userId: data.userId,
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
        
        return NextResponse.json({
          success: true,
          data: member
        })
      } else {
        // Use the existing createMemberWithUser function for new users
        const { createMemberWithUser } = await import('@/lib/member-utils')
        const result = await createMemberWithUser(data)
        return NextResponse.json({
          success: true,
          data: result.member
        })
      }
    }

    // Clean up the data - remove any undefined or null values that shouldn't be sent to Prisma
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    )

    // Create the record
    const result = await (db as any)[modelName].create({
      data: cleanData
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_RECORD',
        entityType: table.toUpperCase(),
        entityId: result.id,
        newValues: cleanData as any,
        timestamp: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Failed to create record:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 