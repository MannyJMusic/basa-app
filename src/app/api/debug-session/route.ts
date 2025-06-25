import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    
    return NextResponse.json({
      hasSession: !!session,
      user: session?.user || null,
      isAdmin: session?.user?.role === 'ADMIN',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in debug session:', error)
    return NextResponse.json(
      { error: 'Failed to get session info' },
      { status: 500 }
    )
  }
} 