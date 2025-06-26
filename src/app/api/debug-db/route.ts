import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const userCount = await db.user.count()
    const settingsCount = await db.settings.count()
    
    return NextResponse.json({
      databaseConnected: true,
      userCount,
      settingsCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        databaseConnected: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 