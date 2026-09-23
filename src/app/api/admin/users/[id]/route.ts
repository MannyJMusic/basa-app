import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { requireAdmin, isResponse, USER_ROLES } from '@/lib/api-auth'

const updateAdminUserSchema = z.object({
  name: z.string().trim().max(200).optional(),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200).optional().or(z.literal('')),
}).strict()

/** What an audit row may record about a user: never hashes or tokens. */
function auditableUser(user: { email: string | null; name: string | null; firstName: string | null; lastName: string | null; role: string; isActive: boolean }) {
  const { email, name, firstName, lastName, role, isActive } = user
  return { email, name, firstName, lastName, role, isActive }
}

// GET /api/admin/users/[id] - Get specific admin user
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session
    const params = await context.params

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        firstName: true,
        lastName: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching admin user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin user' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update admin user
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session
    const params = await context.params

    const parsed = updateAdminUserSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid request' },
        { status: 400 }
      )
    }
    const body = parsed.data

    // An admin cannot lock themselves out: no self-demotion or self-deactivation.
    if (
      session.user.id === params.id &&
      ((body.role !== undefined && body.role !== 'ADMIN') || body.isActive === false)
    ) {
      return NextResponse.json(
        { error: 'You cannot demote or deactivate your own account' },
        { status: 400 }
      )
    }

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      name: body.name,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      isActive: body.isActive
    }

    // Hash password if provided. Setting a new password also ends that user's
    // existing sessions (see the jwt callback in src/lib/auth.ts).
    if (body.password) {
      updateData.hashedPassword = await bcrypt.hash(body.password, 12)
      updateData.sessionsInvalidBefore = new Date()
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        firstName: true,
        lastName: true
      }
    })

    // Log the admin user update
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_ADMIN_USER',
        entityType: 'USER',
        entityId: updatedUser.id,
        oldValues: auditableUser(existingUser),
        newValues: { ...auditableUser(updatedUser), passwordChanged: Boolean(body.password) }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating admin user:', error)
    return NextResponse.json(
      { error: 'Failed to update admin user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete admin user
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session
    const params = await context.params

    // Prevent deleting yourself
    if (session.user.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Get existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id }
    })

    // Log the admin user deletion
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE_ADMIN_USER',
        entityType: 'USER',
        entityId: params.id,
        oldValues: auditableUser(existingUser)
      }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting admin user:', error)
    return NextResponse.json(
      { error: 'Failed to delete admin user' },
      { status: 500 }
    )
  }
} 