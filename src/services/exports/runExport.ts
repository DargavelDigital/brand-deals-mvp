import fs from 'node:fs';
import path from 'node:path';

export async function runExport(jobId: string) {
  const { prisma } = await import('@/lib/prisma');
  const job = await prisma.exportJob.update({
    where: { id: jobId },
    data: { status: 'RUNNING' }
  });

  const wsId = job.workspaceId;

  // Collect datasets (trim if needed)
  const [contacts, audits, sequences, steps, packs, notes, tasks] = await Promise.all([
    prisma.contact.findMany({ where: { workspaceId: wsId }}),
    prisma.audit.findMany({ where: { workspaceId: wsId }}).catch(()=>[] as any),
    prisma.outreachSequence.findMany({ where: { workspaceId: wsId }}).catch(()=>[] as any),
    prisma.sequenceStep.findMany({ where: { sequence: { workspaceId: wsId }}}).catch(()=>[] as any),
    prisma.mediaPack.findMany({ where: { workspaceId: wsId }}).catch(()=>[] as any),
    prisma.contactNote.findMany({ where: { workspaceId: wsId }}).catch(()=>[] as any),
    prisma.contactTask.findMany({ where: { workspaceId: wsId }}).catch(()=>[] as any),
  ]);

  const outDir = path.join('/tmp', `export_${jobId}`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'contacts.json'), JSON.stringify(contacts));
  fs.writeFileSync(path.join(outDir, 'audits.json'), JSON.stringify(audits));
  fs.writeFileSync(path.join(outDir, 'sequences.json'), JSON.stringify(sequences));
  fs.writeFileSync(path.join(outDir, 'steps.json'), JSON.stringify(steps));
  fs.writeFileSync(path.join(outDir, 'mediaPacks.json'), JSON.stringify(packs));
  fs.writeFileSync(path.join(outDir, 'notes.json'), JSON.stringify(notes));
  fs.writeFileSync(path.join(outDir, 'tasks.json'), JSON.stringify(tasks));

  const zipPath = path.join('/tmp', `export_${jobId}.zip`);
  const { default: archiver } = await import('archiver');
  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 }});
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(outDir, false);
    archive.finalize();
  });

  // For simplicity, serve via a signed API link; in prod, upload to S3 and store URL.
  await prisma.exportJob.update({
    where: { id: jobId },
    data: { status: 'DONE', resultUrl: `/api/admin/exports/download?id=${jobId}`, completedAt: new Date() }
  });
}
