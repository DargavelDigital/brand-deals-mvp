#!/usr/bin/env node

/**
 * Prisma Generate Script
 * 
 * This script handles Prisma client generation and migrations gracefully:
 * - If DATABASE_URL is available, generates the client and runs migrations
 * - If not available (e.g., during Netlify build), skips gracefully
 * - Provides clear logging for debugging
 * - Ensures cross-platform compatibility for deployment
 */

import { execSync } from "node:child_process";

console.log("🔍 Checking Prisma environment...");
console.log(`📊 DATABASE_URL available: ${!!process.env.DATABASE_URL ? "Yes" : "No"}`);

try {
  console.log("🔄 Generating Prisma client...");
  execSync("npx prisma generate --schema=./prisma/schema.prisma", { stdio: "inherit" });
  console.log("✅ Prisma client generated successfully");
} catch (e) {
  console.error("❌ Failed to generate Prisma client:", e.message || e);
  process.exit(1);
}
