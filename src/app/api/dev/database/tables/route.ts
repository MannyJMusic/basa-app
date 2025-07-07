import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get counts for all tables
    const counts = {
      User: await db.user.count(),
      Member: await db.member.count(),
      Event: await db.event.count(),
      EventRegistration: await db.eventRegistration.count(),
      BlogPost: await db.blogPost.count(),
      Testimonial: await db.testimonial.count(),
      Lead: await db.lead.count(),
      Resource: await db.resource.count(),
      Settings: await db.settings.count(),
      AuditLog: await db.auditLog.count(),
    }

    return NextResponse.json({
      success: true,
      counts,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database tables error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 