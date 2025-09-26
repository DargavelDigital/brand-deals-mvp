import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { flags } from '@/config/flags';
import { prisma } from '@/lib/prisma';
import { ContactStatus } from '@prisma/client';
import { ok, fail } from '@/lib/http/envelope';
import { log } from '@/lib/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const POST = withIdempotency(async (request: NextRequest) => {
  try {
    // Check if feature is enabled
    if (!flags.contacts.bulk) {
      return NextResponse.json(fail('FEATURE_DISABLED', 404), { status: 404 });
    }

    const { workspaceId, session, demo } = await requireSessionOrDemo(request);
    log.info('[contacts][bulk]', { workspaceId, demo: !!demo, user: session?.user?.email });
    
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 })
    }

    const body = await request.json();
    const { ids, op, value } = body;

    // Validate required fields
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(fail('INVALID_IDS'), { status: 400 });
    }

    if (!op || !['addTag', 'removeTag', 'setStatus', 'exportCsv', 'delete'].includes(op)) {
      return NextResponse.json(fail('INVALID_OPERATION'), { status: 400 });
    }

    // Validate that all contacts belong to the workspace
    const contactCount = await prisma.contact.count({
      where: {
        id: { in: ids },
        workspaceId
      }
    });

    if (contactCount !== ids.length) {
      return NextResponse.json(fail('UNAUTHORIZED_ACCESS', 403), { status: 403 });
    }

    switch (op) {
      case 'addTag':
        if (!value || typeof value !== 'string') {
          return NextResponse.json(fail('INVALID_TAG_VALUE'), { status: 400 });
        }

        await prisma.contact.updateMany({
          where: {
            id: { in: ids },
            workspaceId
          },
          data: {
            tags: {
              push: [value]
            }
          }
        });

        return NextResponse.json(ok(null, { message: `Added tag "${value}" to ${ids.length} contacts` }));

      case 'removeTag':
        if (!value || typeof value !== 'string') {
          return NextResponse.json(fail('INVALID_TAG_VALUE'), { status: 400 });
        }

        // Get all contacts to remove the specific tag
        const contactsToUpdate = await prisma.contact.findMany({
          where: {
            id: { in: ids },
            workspaceId
          },
          select: { id: true, tags: true }
        });

        // Update each contact individually to remove the tag
        for (const contact of contactsToUpdate) {
          const updatedTags = contact.tags.filter(tag => tag !== value);
          await prisma.contact.update({
            where: { id: contact.id },
            data: { tags: updatedTags }
          });
        }

        return NextResponse.json(ok(null, { message: `Removed tag "${value}" from ${ids.length} contacts` }));

      case 'setStatus':
        if (!value || !['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(value)) {
          return NextResponse.json(fail('INVALID_STATUS_VALUE'), { status: 400 });
        }

        await prisma.contact.updateMany({
          where: {
            id: { in: ids },
            workspaceId
          },
          data: {
            status: value as ContactStatus
          }
        });

        return NextResponse.json(ok(null, { message: `Set status to "${value}" for ${ids.length} contacts` }));

      case 'delete':
        // Soft delete by setting status to ARCHIVED and adding bulk-archived tag
        await prisma.contact.updateMany({
          where: {
            id: { in: ids },
            workspaceId
          },
          data: {
            status: 'ARCHIVED' as ContactStatus,
            tags: {
              push: ['bulk-archived']
            }
          }
        });

        return NextResponse.json(ok(null, { message: `Archived ${ids.length} contacts` }));

      case 'exportCsv':
        const contacts = await prisma.contact.findMany({
          where: {
            id: { in: ids },
            workspaceId
          },
          select: {
            name: true,
            email: true,
            company: true,
            status: true,
            verifiedStatus: true,
            seniority: true,

            tags: true,
            createdAt: true
          }
        });

        // Generate CSV content
        const csvHeaders = ['Name', 'Email', 'Company', 'Status', 'Verified Status', 'Seniority', 'Department', 'Tags', 'Created At'];
        const csvRows = contacts.map(contact => [
          contact.name || '',
          contact.email || '',
          contact.company || '',
          contact.status || '',
          contact.verifiedStatus || '',
          contact.seniority || '',

          (contact.tags || []).join('; '),
          contact.createdAt.toISOString()
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
          .join('\n');

        return new NextResponse(csvContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="contacts-export-${new Date().toISOString().split('T')[0]}.csv"`
          }
        });

      default:
        return NextResponse.json(fail('UNSUPPORTED_OPERATION'), { status: 400 });
    }
  } catch (error) {
    log.error('Bulk contacts operation failed:', error);
    return NextResponse.json(fail('INTERNAL_ERROR', 500), { status: 500 });
  }
});
