# Prisma Migration Best Practices

## Enum Migrations

When changing Postgres enums, prefer a manual guarded SQL block to avoid CI deploy failures across environments.

### Example: Safe Enum Creation

```sql
-- Instead of: CREATE TYPE "MyEnum" AS ENUM ('VALUE1', 'VALUE2');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MyEnum') THEN
    CREATE TYPE "MyEnum" AS ENUM ('VALUE1', 'VALUE2');
  END IF;

  -- Ensure all expected labels exist (safe-guard; each IF prevents duplicate errors)
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='MyEnum' AND e.enumlabel='VALUE1'
  ) THEN
    ALTER TYPE "MyEnum" ADD VALUE 'VALUE1';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='MyEnum' AND e.enumlabel='VALUE2'
  ) THEN
    ALTER TYPE "MyEnum" ADD VALUE 'VALUE2';
  END IF;
END$$;
```

### Example: Safe Enum Value Addition

```sql
-- Instead of: ALTER TYPE "MyEnum" ADD VALUE 'NEW_VALUE';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid=t.oid
    WHERE t.typname='MyEnum' AND e.enumlabel='NEW_VALUE'
  ) THEN
    ALTER TYPE "MyEnum" ADD VALUE 'NEW_VALUE';
  END IF;
END$$;
```

### Why This Approach?

1. **Idempotent**: Can be run multiple times without errors
2. **Environment Safe**: Works regardless of whether the enum/values already exist
3. **CI Friendly**: Prevents deployment failures across different environments
4. **PostgreSQL Compatible**: Uses standard PostgreSQL features

### Migration Repair Commands

If a migration fails:

```bash
# Mark as rolled back (if you want to retry)
pnpm prisma migrate resolve --rolled-back <migration_name>

# Mark as applied (if you manually fixed the database)
pnpm prisma migrate resolve --applied <migration_name>

# Check migration status
pnpm prisma migrate status
```

### Package.json Scripts

```json
{
  "scripts": {
    "db:migrate:repair": "prisma migrate resolve --rolled-back <migration_name>",
    "db:migrate:deploy": "prisma migrate deploy"
  }
}
```

### Netlify Build Command

```bash
pnpm install
pnpm prisma generate
pnpm db:migrate:repair || true  # || true lets pipeline proceed if already repaired
pnpm db:migrate:deploy
pnpm build
```
