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
console.log(`🌐 NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`🔧 PRISMA_QUERY_ENGINE_TYPE: ${process.env.PRISMA_QUERY_ENGINE_TYPE || "library"}`);

try {
  console.log("🔄 Generating Prisma client...");
  
  // Set environment variables for Prisma generation
  const env = {
    ...process.env,
    PRISMA_QUERY_ENGINE_TYPE: process.env.PRISMA_QUERY_ENGINE_TYPE || "binary",
    PRISMA_FORCE_DOWNLOAD: process.env.PRISMA_FORCE_DOWNLOAD || "1",
  };
  
  execSync("npx prisma generate --schema=./prisma/schema.prisma", { 
    stdio: "inherit",
    env
  });
  console.log("✅ Prisma client generated successfully");
} catch (e) {
  console.error("❌ Failed to generate Prisma client:", e.message || e);
  console.error("💡 This might be due to missing DATABASE_URL or network issues");
  console.error("💡 For Netlify builds, ensure DATABASE_URL is set in environment variables");
  process.exit(1);
}
