import { prisma } from '@/lib/prisma';
import type { ImportKind, Mapping, PreviewRow } from './types';

function normalize(kind: ImportKind, row: PreviewRow, map: Mapping) {
  const v = (k: string) => row[k] ?? '';
  switch (kind) {
    case 'CONTACT':
      return {
        email: v(map.email).toLowerCase().trim(),
        name: v(map.name) || v(map.firstName)+' '+v(map.lastName),
        title: v(map.title) || null,
        company: v(map.company) || null,
        phone: v(map.phone) || null,
        source: 'IMPORT',
      };
    case 'BRAND':
      return {
        name: v(map.name),
        domain: v(map.domain)?.toLowerCase() || null,
        industry: v(map.industry) || null,
      };
    case 'DEAL':
      return {
        title: v(map.title),
        value: Number(v(map.value) ?? 0) || 0,
        description: v(map.notes) || null,
      };
  }
}

async function dedupeKey(kind: ImportKind, rec: any) {
  if (kind === 'CONTACT') return rec.email;
  if (kind === 'BRAND') return rec.domain || `${rec.name}|${rec.industry || ''}`.toLowerCase();
  if (kind === 'DEAL') return `${rec.title}|${rec.value}`;
  return '';
}

export async function ingestRows(opts: {
  workspaceId: string,
  kind: ImportKind,
  rows: PreviewRow[],
  mapping: Mapping,
  importJobId: string
}) {
  let createdIds: string[] = [];
  for (const row of opts.rows) {
    const data = normalize(opts.kind, row, opts.mapping);
    const key = await dedupeKey(opts.kind, data);
    if (!key) continue;

    // simple dedupe via upsert
    if (opts.kind === 'CONTACT' && data.email) {
      const c = await prisma().contact.upsert({
        where: { workspaceId_email: { workspaceId: opts.workspaceId, email: data.email }},
        create: { ...data, workspaceId: opts.workspaceId },
        update: { ...data },
      });
      createdIds.push(c.id);
    } else if (opts.kind === 'BRAND') {
      const where = data.domain ? { workspaceId_domain: { workspaceId: opts.workspaceId, domain: data.domain }}
                                : { workspaceId_name: { workspaceId: opts.workspaceId, name: data.name }};
      // @ts-ignore
      const b = await prisma().brand.upsert({
        where,
        create: { ...data, workspaceId: opts.workspaceId },
        update: { ...data },
      });
      createdIds.push(b.id);
    } else if (opts.kind === 'DEAL') {
      const d = await prisma().deal.create({ data: { ...data, workspaceId: opts.workspaceId, brandId: (await ensureBrand(opts.workspaceId, row, opts.mapping)).id }});
      createdIds.push(d.id);
    }
  }
  // store createdIds snapshot on ImportJob.summaryJson
  await prisma().importJob.update({
    where: { id: opts.importJobId },
    data: { summaryJson: { path: ['createdIds'], set: { [opts.kind.toLowerCase()]: createdIds } } as any }
  });
}

async function ensureBrand(workspaceId: string, row: PreviewRow, map: Mapping) {
  const name = row[map.brandName] || 'Unknown';
  const domain = (row[map.brandDomain] || '').toLowerCase();
  const where = domain ? { workspaceId_domain: { workspaceId, domain }} : { workspaceId_name: { workspaceId, name }};
  // @ts-ignore
  return prisma().brand.upsert({ where, create: { workspaceId, name, domain }, update: {} });
}
