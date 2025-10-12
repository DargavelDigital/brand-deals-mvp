import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await prisma().user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    console.log('[Registration] Creating new user:', normalizedEmail)

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma().user.create({
      data: {
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        updatedAt: new Date()
      },
    })

    console.log('[Registration] User created:', user.id)

    // Create credentials account with hashed password
    await prisma().account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
        // Store hashed password in access_token field
        access_token: hashedPassword,
      },
    })

    console.log('[Registration] Credentials account created')

    // Create personal workspace
    const workspace = await prisma().workspace.create({
      data: {
        name: `${name || normalizedEmail.split('@')[0]}'s Workspace`,
        slug: `ws-${user.id.slice(0, 8)}`,
      },
    })

    console.log('[Registration] Workspace created:', workspace.id)

    // Add user to workspace as owner
    await prisma().membership.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'OWNER',
      },
    })

    console.log('[Registration] Membership created - registration complete!')

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('[Registration] Error:', error)
    return NextResponse.json(
      {
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

