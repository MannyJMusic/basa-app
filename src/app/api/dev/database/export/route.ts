import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const format = searchParams.get('format') || 'json'
    const search = searchParams.get('search') || ''
    const columns = searchParams.get('columns')?.split(',') || []

    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table parameter is required' },
        { status: 400 }
      )
    }

    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Format must be json or csv' },
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

    // Get all data (no pagination for export)
    const data = await (db as any)[modelName].findMany({
      where: whereClause,
      orderBy: orderByConfig[table] || { id: 'desc' }
    })

    // Filter columns if specified
    const availableColumns = data.length > 0 ? Object.keys(data[0]) : []
    const selectedColumns = columns.length > 0 ? columns.filter(col => availableColumns.includes(col)) : availableColumns
    
    // Filter data to only include selected columns
    const filteredData = data.map((row: any) => {
      const filteredRow: any = {}
      selectedColumns.forEach(col => {
        filteredRow[col] = row[col]
      })
      return filteredRow
    })

    if (format === 'json') {
      return NextResponse.json(filteredData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${table}-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    } else if (format === 'csv') {
      // Convert to CSV
      if (filteredData.length === 0) {
        return new NextResponse('', {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${table}-${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }

      const csvHeader = selectedColumns.join(',')
      const csvRows = filteredData.map((row: any) => 
        selectedColumns.map(column => {
          const value = row[column]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
      
      const csvContent = [csvHeader, ...csvRows].join('\n')

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${table}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid format' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Database export error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      },
      { status: 500 }
    )
  }
} 