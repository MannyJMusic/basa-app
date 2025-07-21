import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get session using the auth function
    const session = await auth()
    
    // Get URL parameters to help debug redirect issues
    const { searchParams } = new URL(request.url)
    const debugParam = searchParams.get('debug')
    
    // Get all cookies for debugging
    const cookies = request.headers.get('cookie')
    const cookieList = cookies ? cookies.split(';').map(c => c.trim()) : []
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasSession: !!session,
      sessionUser: session?.user || null,
      sessionKeys: session ? Object.keys(session) : [],
      cookies: {
        hasNextAuthSession: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        allCookies: cookieList,
        nextAuthCookies: cookieList.filter(c => c.includes('authjs') || c.includes('next-auth'))
      },
      // Add OAuth-specific debug info
      oauth: {
        googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set',
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set',
        linkedinClientId: process.env.LINKEDIN_CLIENT_ID ? 'Set' : 'Not Set',
        linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET ? 'Set' : 'Not Set',
      },
      // Add redirect debugging
      redirect: {
        expectedCallbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
        expectedLinkedinCallbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin`,
      }
    }

    // If debug parameter is provided, add more detailed info
    if (debugParam === 'oauth') {
      debugInfo.oauth = {
        ...debugInfo.oauth,
        googleClientId: process.env.GOOGLE_CLIENT_ID || 'Not Set',
        linkedinClientId: process.env.LINKEDIN_CLIENT_ID || 'Not Set',
      }
    }
    
    return NextResponse.json(debugInfo)
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, provider } = body
    
    if (action === 'test-oauth') {
      // Test OAuth configuration
      const testInfo = {
        timestamp: new Date().toISOString(),
        action: 'test-oauth',
        provider,
        environment: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        oauthConfig: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Missing',
            callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
          },
          linkedin: {
            clientId: process.env.LINKEDIN_CLIENT_ID ? 'Configured' : 'Missing',
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? 'Configured' : 'Missing',
            callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin`
          }
        },
        recommendations: [] as string[]
      }
      
      // Add recommendations based on configuration
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        testInfo.recommendations.push('Google OAuth credentials are missing')
      }
      if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
        testInfo.recommendations.push('LinkedIn OAuth credentials are missing')
      }
      if (!process.env.NEXTAUTH_URL) {
        testInfo.recommendations.push('NEXTAUTH_URL is not set')
      }
      if (!process.env.NEXTAUTH_SECRET) {
        testInfo.recommendations.push('NEXTAUTH_SECRET is not set')
      }
      
      return NextResponse.json(testInfo)
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in debug auth POST:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 