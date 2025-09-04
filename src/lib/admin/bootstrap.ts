import { spawn } from 'child_process';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export interface BootstrapResult {
  ok: boolean;
  migrated: boolean;
  seeded: boolean;
  workspaceId?: string;
  traceId: string;
  error?: string;
}

/**
 * Runs Prisma migrations using child_process.spawn
 * Captures logs and errors for debugging
 */
export async function runMigrations(): Promise<{ success: boolean; logs: string[]; error?: string }> {
  const logs: string[] = [];
  const traceId = randomUUID();
  
  return new Promise((resolve) => {
    logs.push(`[${traceId}] Starting Prisma migrations...`);
    
    const child = spawn('npx', ['prisma', 'migrate', 'deploy'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    child.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      logs.push(`[${traceId}] STDOUT: ${output}`);
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString().trim();
      logs.push(`[${traceId}] STDERR: ${output}`);
    });

    child.on('close', (code) => {
      if (code === 0) {
        logs.push(`[${traceId}] Migrations completed successfully`);
        resolve({ success: true, logs });
      } else {
        const error = `Migration failed with exit code ${code}`;
        logs.push(`[${traceId}] ERROR: ${error}`);
        resolve({ success: false, logs, error });
      }
    });

    child.on('error', (err) => {
      const error = `Failed to spawn migration process: ${err.message}`;
      logs.push(`[${traceId}] ERROR: ${error}`);
      resolve({ success: false, logs, error });
    });
  });
}

/**
 * Seeds the database if no workspace exists
 * Creates a staging workspace and minimal owner user
 */
export async function seedIfNeeded(): Promise<{ success: boolean; workspaceId?: string; error?: string }> {
  try {
    // Check if any workspace exists
    const existingWorkspace = await prisma.workspace.findFirst({
      select: { id: true, slug: true }
    });

    if (existingWorkspace) {
      return { success: true, workspaceId: existingWorkspace.id };
    }

    // Create staging workspace
    const workspace = await prisma.workspace.create({
      data: {
        id: `workspace_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        slug: 'staging-workspace',
        name: 'Staging Workspace',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create minimal owner user
    const user = await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        email: 'admin@staging.local',
        name: 'Staging Admin',
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create membership
    await prisma.membership.create({
      data: {
        id: `membership_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId: user.id,
        workspaceId: workspace.id,
        role: 'OWNER',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Check if FeatureFlags table exists and create default flags
    try {
      await prisma.featureFlag.createMany({
        data: [
          {
            id: `flag_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            workspaceId: workspace.id,
            key: 'DEMO_AUTH',
            value: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        skipDuplicates: true
      });
    } catch (e) {
      // FeatureFlags table might not exist, that's okay
      console.log('FeatureFlags table not found, skipping flag creation');
    }

    return { success: true, workspaceId: workspace.id };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown seeding error' 
    };
  }
}

/**
 * Validates the admin token from request headers
 */
export function validateAdminToken(request: Request): boolean {
  const token = request.headers.get('X-Admin-Token');
  const expectedToken = process.env.BOOTSTRAP_TOKEN;
  
  if (!expectedToken) {
    console.error('BOOTSTRAP_TOKEN environment variable not set');
    return false;
  }
  
  if (!token) {
    console.error('X-Admin-Token header missing');
    return false;
  }
  
  if (token !== expectedToken) {
    console.error('X-Admin-Token header invalid');
    return false;
  }
  
  return true;
}
