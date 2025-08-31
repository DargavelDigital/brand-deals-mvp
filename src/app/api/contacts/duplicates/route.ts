import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/requireAuth';
import { flags } from '@/lib/flags/index';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check if feature is enabled
            if (!flags.contacts.dedupe) {
      return NextResponse.json({ ok: false, error: 'FEATURE_DISABLED' }, { status: 404 });
    }

    const authResult = await requireAuth(['OWNER', 'MANAGER', 'MEMBER']);
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, error: authResult.error }, { status: authResult.status });
    }
    const { workspaceId } = authResult.ctx;

    // Find duplicate emails
    const duplicateEmails = await prisma.$queryRaw<Array<{ email: string; count: bigint }>>`
      SELECT lower(email) AS email, COUNT(*) as count 
      FROM "Contact" 
      WHERE "workspaceId" = ${workspaceId} 
        AND email IS NOT NULL 
        AND email != ''
      GROUP BY lower(email) 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    // Find duplicate domains
    const duplicateDomains = await prisma.$queryRaw<Array<{ domain: string; count: bigint }>>`
      SELECT split_part(lower(email), '@', 2) AS domain, COUNT(*) as count 
      FROM "Contact" 
      WHERE "workspaceId" = ${workspaceId} 
        AND email IS NOT NULL 
        AND email != ''
        AND email LIKE '%@%'
      GROUP BY split_part(lower(email), '@', 2) 
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    // Get detailed contact info for duplicates
    const duplicateGroups = [];

    // Process email duplicates
    for (const { email } of duplicateEmails) {
      const contacts = await prisma.contact.findMany({
        where: {
          workspaceId,
          email: {
            mode: 'insensitive',
            equals: email
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });

      duplicateGroups.push({
        type: 'email',
        value: email,
        count: contacts.length,
        contacts
      });
    }

    // Process domain duplicates
    for (const { domain } of duplicateDomains) {
      const contacts = await prisma.contact.findMany({
        where: {
          workspaceId,
          email: {
            mode: 'insensitive',
            endsWith: `@${domain}`
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      });

      duplicateGroups.push({
        type: 'domain',
        value: domain,
        count: contacts.length,
        contacts
      });
    }

    return NextResponse.json({
      ok: true,
      duplicateGroups,
      totalGroups: duplicateGroups.length,
      totalDuplicates: duplicateGroups.reduce((sum, group) => sum + group.count, 0)
    });

  } catch (error) {
    console.error('Error detecting duplicates:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
