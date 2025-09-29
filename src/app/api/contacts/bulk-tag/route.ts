import { NextResponse } from 'next/server';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(req: Request) {
  try {
    const { workspaceId, session, demo } = await requireSessionOrDemo(req as any);
    console.info('[contacts][bulk-tag]', { workspaceId, demo: !!demo, user: session?.user?.email });
    
    if (!workspaceId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const { ids, tag } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0 || !tag || typeof tag !== 'string') {
      return NextResponse.json({ ok: false, error: 'INVALID_INPUT' }, { status: 400 });
    }

    // Get existing contacts to update their tags
    const contacts = await prisma().contact.findMany({
      where: {
        id: { in: ids },
        workspaceId: workspaceId,
      },
      select: { id: true, tags: true },
    });

    // Update each contact's tags
    const updatePromises = contacts.map(contact => {
      const existingTags = contact.tags || [];
      const newTags = existingTags.includes(tag) 
        ? existingTags 
        : [...existingTags, tag];
      
      return prisma().contact.update({
        where: { id: contact.id },
        data: { tags: newTags },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      ok: true, 
      message: `Added tag "${tag}" to ${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`,
      count: contacts.length 
    });
  } catch (error: any) {
    console.error('Bulk tag error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || 'BULK_TAG_FAILED' 
    }, { status: 500 });
  }
}

