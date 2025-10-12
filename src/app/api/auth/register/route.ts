import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { randomBytes, randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    console.log('[Registration] Attempting registration for:', email)

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

    // Check if user already exists
    const existingUser = await prisma().user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    console.log('[Registration] Creating new user:', email)

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Generate IDs manually
    const userId = randomUUID()
    const workspaceId = randomUUID()

    console.log('[Registration] Generated IDs:', { userId, workspaceId })

    // Create user with explicit ID
    const user = await prisma().user.create({
      data: {
        id: userId,
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        updatedAt: new Date()
      },
    })

    console.log('[Registration] User created:', user.id)

    // Create credentials account
    await prisma().account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
        access_token: hashedPassword, // Store hashed password
      },
    })

    console.log('[Registration] Credentials account created')

    // Create personal workspace with explicit ID
    const workspace = await prisma().workspace.create({
      data: {
        id: workspaceId,
        name: `${name || email.split('@')[0]}'s Workspace`,
        slug: `ws-${userId.slice(0, 8)}`,
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

    console.log('[Registration] Membership created')

    // Generate email verification token (optional)
    const verificationToken = randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    try {
      await prisma().verificationToken.create({
        data: {
          identifier: email.toLowerCase(),
          token: verificationToken,
          expires: verificationExpires,
        },
      })
      console.log('[Registration] Verification token created')
    } catch (e) {
      // VerificationToken table might not exist
      console.log('[Registration] Could not create verification token (table may not exist)')
    }

    // TODO: Send welcome email with verification link
    // await sendWelcomeEmail(email, name, verificationToken);

    console.log('[Registration] Registration successful for:', email)

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
    console.error('[Registration] Error details:', error instanceof Error ? error.message : 'Unknown')
    console.error('[Registration] Stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      {
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
