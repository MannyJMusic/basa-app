import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') || 'google'
    
    // Test OAuth configuration
    const testInfo = {
      timestamp: new Date().toISOString(),
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
  } catch (error) {
    console.error('Error in test OAuth:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test OAuth configuration',
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
    const { provider = 'google' } = body
    
    // This would initiate the OAuth flow
    // Note: This is just for testing - in practice, you'd use the signIn function from next-auth/react
    const signInUrl = `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent('/dashboard')}`
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      action: 'initiate-oauth',
      provider,
      signInUrl,
      message: 'Use this URL to test OAuth flow'
    })
  } catch (error) {
    console.error('Error initiating OAuth:', error)
    return NextResponse.json(
      { 
        error: 'Failed to initiate OAuth',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 