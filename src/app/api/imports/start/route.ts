import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { streamCsv, fetchSheetAsCsv, firstN } from '@/services/imports/reader';
import type { StartImportInput } from '@/services/imports/types';
import { requireSessionOrDemo } from '@/lib/auth/requireSessionOrDemo';

export async function POST(req: NextRequest) {
  const { workspaceId } = await requireSessionOrDemo(req);
  const ct = req.headers.get('content-type') || '';
  let input: StartImportInput;
  let csvBuf: Buffer|undefined;

  if (ct.includes('multipart/form-data')) {
    const form = await req.formData();
    input = JSON.parse(String(form.get('input') || '{}'));
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ ok:false, error:'FILE_REQUIRED' }, { status: 400 });
    csvBuf = Buffer.from(await file.arrayBuffer());
  } else {
    input = await req.json();
    if (input.source === 'GSHEETS' && input.sheetId) {
      csvBuf = await fetchSheetAsCsv(input.sheetId, input.sheetRange);
    } else {
      return NextResponse.json({ ok:false, error:'UNSUPPORTED_SOURCE' }, { status: 400 });
    }
  }

  const job = await prisma.importJob.create({
    data: { workspaceId, kind: input.kind, source: input.source, fileUrl: input.fileUrl ?? null, sheetId: input.sheetId ?? null, sheetRange: input.sheetRange ?? null, status: 'RECEIVED' }
  });

  const preview = await firstN(streamCsv(csvBuf!), 100);
  const headers = preview.length ? Object.keys(preview[0]) : [];
  return NextResponse.json({ ok:true, jobId: job.id, preview, headers });
}
