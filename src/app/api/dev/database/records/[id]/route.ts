import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
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

    // Get existing record for audit log
    const existingRecord = await (db as any)[modelName].findUnique({
      where: { id: params.id }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }

    // Special handling for Member records to ensure User relationship
    if (table === 'Member') {
      const { updateMemberWithUser } = await import('@/lib/member-utils')
      const result = await updateMemberWithUser(params.id, data)
      return NextResponse.json({
        success: true,
        data: result
      })
    }

    // Clean up the data - remove any undefined or null values that shouldn't be sent to Prisma
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
    )

    // Update the record
    const result = await (db as any)[modelName].update({
      where: { id: params.id },
      data: cleanData
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_RECORD',
        entityType: table.toUpperCase(),
        entityId: params.id,
        oldValues: existingRecord,
        newValues: cleanData as any,
        timestamp: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Failed to update record:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')

    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table parameter is required' },
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

    // Get existing record for audit log
    const existingRecord = await (db as any)[modelName].findUnique({
      where: { id: params.id }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: 'Record not found' },
        { status: 404 }
      )
    }

    // Delete the record
    await (db as any)[modelName].delete({
      where: { id: params.id }
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_RECORD',
        entityType: table.toUpperCase(),
        entityId: params.id,
        oldValues: existingRecord,
        timestamp: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete record:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 