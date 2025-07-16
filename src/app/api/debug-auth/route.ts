import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    // Get session using the auth function
    const session = await auth()
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasSession: !!session,
      sessionUser: session?.user || null,
      sessionKeys: session ? Object.keys(session) : [],
      cookies: {
        hasNextAuthSession: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      }
    })
  } catch (error) {
    console.error('Error in debug auth:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get auth info',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 