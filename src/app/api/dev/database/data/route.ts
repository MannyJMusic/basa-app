import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const columns = searchParams.get('columns')?.split(',') || []

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

    const skip = (page - 1) * pageSize

    // Define searchable fields for each table
    const searchFields: Record<string, string[]> = {
      User: ['email', 'firstName', 'lastName', 'name'],
      Member: ['businessName', 'businessEmail', 'city', 'state'],
      Event: ['title', 'description', 'location', 'city'],
      EventRegistration: ['name', 'email', 'company'],
      BlogPost: ['title', 'excerpt', 'content'],
      Testimonial: ['authorName', 'content', 'company'],
      Lead: ['name', 'email', 'company'],
      Resource: ['title', 'description'],
      Settings: ['organizationName', 'contactEmail'],
      AuditLog: ['action', 'entityType', 'entityId'],
    }

    // Build where clause for search
    let whereClause: any = {}
    if (search && searchFields[table]) {
      const searchConditions = searchFields[table].map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive' as const
        }
      }))
      whereClause = {
        OR: searchConditions
      }
    }

    // Define default ordering for each table
    const orderByConfig: Record<string, any> = {
      User: { createdAt: 'desc' },
      Member: { joinedAt: 'desc' },
      Event: { createdAt: 'desc' },
      EventRegistration: { createdAt: 'desc' },
      BlogPost: { createdAt: 'desc' },
      Testimonial: { createdAt: 'desc' },
      Lead: { createdAt: 'desc' },
      Resource: { createdAt: 'desc' },
      Settings: { createdAt: 'desc' },
      AuditLog: { timestamp: 'desc' },
    }

    // Get total count
    const totalCount = await (db as any)[modelName].count({
      where: whereClause
    })

    // Get paginated data with error handling for missing columns
    let data
    try {
      data = await (db as any)[modelName].findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: orderByConfig[table] || { id: 'desc' }
      })
    } catch (error) {
      // If there's a column error, try without ordering
      if (error instanceof Error && error.message.includes('column') && error.message.includes('does not exist')) {
        console.warn(`Column error for table ${table}, trying without ordering:`, error.message)
        data = await (db as any)[modelName].findMany({
          where: whereClause,
          skip,
          take: pageSize
        })
      } else {
        throw error
      }
    }

    // Use provided columns or get all columns from first record
    const availableColumns = data.length > 0 ? Object.keys(data[0]) : []
    const selectedColumns = columns.length > 0 ? columns.filter(col => availableColumns.includes(col)) : availableColumns

    return NextResponse.json({
      success: true,
      data: {
        columns: selectedColumns,
        data,
        totalCount
      },
      pagination: {
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    })
  } catch (error) {
    console.error('Database data error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      },
      { status: 500 }
    )
  }
} 