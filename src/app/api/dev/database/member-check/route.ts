import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID parameter is required' },
        { status: 400 }
      )
    }

    // Check if a member record exists for this user
    const member = await db.member.findUnique({
      where: { userId: userId },
      select: { id: true }
    })

    return NextResponse.json({
      success: true,
      hasMember: !!member,
      userId: userId
    })
  } catch (error) {
    console.error('Member check error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      },
      { status: 500 }
    )
  }
} 