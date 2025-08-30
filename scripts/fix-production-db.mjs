#!/usr/bin/env node

/**
 * Production Database Fix Script
 * 
 * This script applies the necessary database schema changes to fix
 * the failed migration 20250829190446_epic19_deal_tracker.
 * 
 * It uses Prisma's raw SQL execution instead of requiring psql,
 * making it compatible with Netlify's build environment.
 */

import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🔧 Starting production database fix...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  
  try {
    console.log('📊 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Apply all the fixes from our SQL script
    console.log('🔧 Applying database schema fixes...');

    // 1. Add missing DealStatus enum values
    console.log('  - Adding DealStatus enum values...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e 
          JOIN pg_type t ON e.enumtypid = t.oid 
          WHERE t.typname = 'DealStatus' AND e.enumlabel = 'OPEN'
        ) THEN 
          ALTER TYPE "public"."DealStatus" ADD VALUE 'OPEN'; 
        END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e 
          JOIN pg_type t ON e.enumtypid = t.oid 
          WHERE t.typname = 'DealStatus' AND e.enumlabel = 'COUNTERED'
        ) THEN 
          ALTER TYPE "public"."DealStatus" ADD VALUE 'COUNTERED'; 
        END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e 
          JOIN pg_type t ON e.enumtypid = t.oid 
          WHERE t.typname = 'DealStatus' AND e.enumlabel = 'WON'
        ) THEN 
          ALTER TYPE "public"."DealStatus" ADD VALUE 'WON'; 
        END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum e 
          JOIN pg_type t ON e.enumtypid = t.oid 
          WHERE t.typname = 'DealStatus' AND e.enumlabel = 'LOST'
        ) THEN 
          ALTER TYPE "public"."DealStatus" ADD VALUE 'LOST'; 
        END IF;
      END $$;
    `;

    // 2. Create AdminRole enum if it doesn't exist
    console.log('  - Creating AdminRole enum...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AdminRole') THEN
          CREATE TYPE "public"."AdminRole" AS ENUM ('SUPER', 'SUPPORT');
        END IF;
      END $$;
    `;

    // 3. Add missing columns to Deal table
    console.log('  - Adding columns to Deal table...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'Deal' AND column_name = 'category'
        ) THEN
          ALTER TABLE "public"."Deal" ADD COLUMN "category" TEXT;
        END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'Deal' AND column_name = 'counterAmount'
        ) THEN
          ALTER TABLE "public"."Deal" ADD COLUMN "counterAmount" INTEGER;
        END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'Deal' AND column_name = 'creatorId'
        ) THEN
          ALTER TABLE "public"."Deal" ADD COLUMN "creatorId" TEXT;
        END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'Deal' AND column_name = 'finalAmount'
        ) THEN
          ALTER TABLE "public"."Deal" ADD COLUMN "finalAmount" INTEGER;
        END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'Deal' AND column_name = 'offerAmount'
        ) THEN
          ALTER TABLE "public"."Deal" ADD COLUMN "offerAmount" INTEGER NOT NULL DEFAULT 0;
        END IF;
      END $$;
    `;

    // 4. Set default value for status after ensuring enum values exist
    console.log('  - Setting default value for Deal.status...');
    await prisma.$executeRaw`
      ALTER TABLE "public"."Deal" ALTER COLUMN "status" SET DEFAULT 'OPEN';
    `;

    // 5. Add missing columns to AuditLog table
    console.log('  - Adding columns to AuditLog table...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'AuditLog' AND column_name = 'adminId'
        ) THEN
          ALTER TABLE "public"."AuditLog" ADD COLUMN "adminId" TEXT;
        END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'AuditLog' AND column_name = 'ip'
        ) THEN
          ALTER TABLE "public"."AuditLog" ADD COLUMN "ip" TEXT;
        END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'AuditLog' AND column_name = 'traceId'
        ) THEN
          ALTER TABLE "public"."AuditLog" ADD COLUMN "traceId" TEXT;
        END IF;
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'AuditLog' AND column_name = 'ua'
        ) THEN
          ALTER TABLE "public"."AuditLog" ADD COLUMN "ua" TEXT;
        END IF;
      END $$;
    `;

    // 6. Add invitedById to Membership table
    console.log('  - Adding invitedById to Membership table...');
    await prisma.$executeRaw`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'Membership' AND column_name = 'invitedById'
        ) THEN
          ALTER TABLE "public"."Membership" ADD COLUMN "invitedById" TEXT;
        END IF;
      END $$;
    `;

    // 7. Create missing tables
    console.log('  - Creating missing tables...');
    
    // Admin table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."Admin" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "role" "public"."AdminRole" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // ImpersonationSession table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."ImpersonationSession" (
        "id" TEXT NOT NULL,
        "adminId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "endedAt" TIMESTAMP(3),
        CONSTRAINT "ImpersonationSession_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // RunStepExecution table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."RunStepExecution" (
        "id" TEXT NOT NULL,
        "runId" TEXT NOT NULL,
        "step" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" TIMESTAMP(3),
        "result" JSONB,
        CONSTRAINT "RunStepExecution_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // ErrorEvent table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "public"."ErrorEvent" (
        "id" TEXT NOT NULL,
        "workspaceId" TEXT NOT NULL,
        "userId" TEXT,
        "error" TEXT NOT NULL,
        "stack" TEXT,
        "context" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ErrorEvent_pkey" PRIMARY KEY ("id")
      );
    `;

    // 8. Create missing indexes
    console.log('  - Creating missing indexes...');
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Deal_workspaceId_status_idx" ON "public"."Deal"("workspaceId", "status");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Deal_workspaceId_category_idx" ON "public"."Deal"("workspaceId", "category");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Deal_workspaceId_createdAt_idx" ON "public"."Deal"("workspaceId", "createdAt");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Membership_invitedById_idx" ON "public"."Membership"("invitedById");
    `;

    // 9. Mark migration as applied in Prisma's internal table
    console.log('  - Marking migration as applied...');
    await prisma.$executeRaw`
      INSERT INTO "_prisma_migrations" (
        "id", "checksum", "finished_at", "migration_name", 
        "logs", "rolled_back_at", "started_at", "applied_steps_count"
      ) VALUES (
        '20250829190446_epic19_deal_tracker',
        'manual_fix_applied_via_script',
        NOW(),
        '20250829190446_epic19_deal_tracker',
        '{"message": "Applied via manual fix script"}',
        NULL,
        NOW(),
        1
      )
      ON CONFLICT ("id") DO UPDATE SET
        "checksum" = 'manual_fix_applied_via_script',
        "finished_at" = NOW(),
        "logs" = '{"message": "Updated via manual fix script"}',
        "rolled_back_at" = NULL,
        "applied_steps_count" = 1;
    `;

    console.log('✅ All database fixes applied successfully!');
    console.log('🎯 Migration 20250829190446_epic19_deal_tracker is now marked as applied');

  } catch (error) {
    console.error('❌ Error applying database fixes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
