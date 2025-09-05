const prefix = (process.env.DATABASE_URL || '').split(':')[0];
const engine = process.env.PRISMA_QUERY_ENGINE_TYPE || 'unset';
if (prefix !== 'postgresql' && prefix !== 'postgres') {
  console.error('[verify-prisma-build] BAD DATABASE_URL prefix:', prefix);
  process.exit(1);
}
if (engine && engine !== 'binary' && engine !== 'unset') {
  console.error('[verify-prisma-build] BAD PRISMA_QUERY_ENGINE_TYPE:', engine);
  process.exit(1);
}
console.log('[verify-prisma-build] OK prefix=%s engine=%s', prefix, engine);
