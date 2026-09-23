import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { requireAdmin, isResponse, USER_ROLES } from '@/lib/api-auth'

const createAdminUserSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  name: z.string().trim().max(200).optional(),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  role: z.enum(USER_ROLES),
}).strict()

// GET /api/admin/users - Get all admin users
export async function GET() {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(adminUsers)
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new admin user
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (isResponse(session)) return session

    const parsed = createAdminUserSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid request' },
        { status: 400 }
      )
    }
    const body = parsed.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12)

    // Create new admin user
    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        firstName: body.firstName,
        lastName: body.lastName,
        hashedPassword,
        role: body.role,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        firstName: true,
        lastName: true
      }
    })

    // Log the admin user creation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_ADMIN_USER',
        entityType: 'USER',
        entityId: newUser.id,
        newValues: {
          email: newUser.email,
          role: newUser.role
        }
      }
    })

    return NextResponse.json(newUser)
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
} 