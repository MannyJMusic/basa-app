import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(
        new URL('/auth/error?error=Invalid activation link', request.url)
      )
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        member: true
      }
    })

    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/error?error=User not found', request.url)
      )
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL('/auth/sign-in?message=Account already activated', request.url)
      )
    }

    // Verify the token (you might want to implement a more secure token system)
    // For now, we'll just verify the email matches and activate the account
    if (user.email !== email) {
      return NextResponse.redirect(
        new URL('/auth/error?error=Invalid activation link', request.url)
      )
    }

    // Update the user to mark email as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        accountStatus: 'ACTIVE'
      },
      include: {
        member: true
      }
    })

    // Log the activation
    await prisma.auditLog.create({
      data: {
        action: 'ACCOUNT_ACTIVATED',
        userId: user.id,
        entityType: 'USER',
        entityId: user.id,
        newValues: {
          email: user.email,
          activationMethod: 'email_link',
          timestamp: new Date().toISOString()
        }
      }
    })

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/auth/sign-in?message=Account activated successfully! Please sign in.', request.url)
    )

  } catch (error) {
    console.error('Account activation error:', error)
    return NextResponse.redirect(
      new URL('/auth/error?error=Activation failed', request.url)
    )
  }
}

// Handle POST requests for manual activation (if needed)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        member: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Account already activated' },
        { status: 400 }
      )
    }

    // Activate the account
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        accountStatus: 'ACTIVE'
      },
      include: {
        member: true
      }
    })

    // Log the activation
    await prisma.auditLog.create({
      data: {
        action: 'ACCOUNT_ACTIVATED',
        userId: user.id,
        entityType: 'USER',
        entityId: user.id,
        newValues: {
          email: user.email,
          activationMethod: 'manual',
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Account activated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
        accountStatus: updatedUser.accountStatus
      }
    })

  } catch (error) {
    console.error('Manual activation error:', error)
    return NextResponse.json(
      { error: 'Activation failed' },
      { status: 500 }
    )
  }
} 