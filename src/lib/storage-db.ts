// src/lib/storage-db.ts
import { NextResponse } from "next/server";
import type { PrismaClient } from "@prisma/client";

// Prefer your existing prisma() helper if you have one:
let prismaFn: () => PrismaClient;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const svc = require("@/services/prisma");
  prismaFn = svc.prisma || svc.default || svc;
} catch {
  // fallback lazy singleton
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client");
  const _global = globalThis as any;
  _global.__prisma ||= new PrismaClient();
  prismaFn = () => _global.__prisma as PrismaClient;
}

const APP_URL = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_HOST || "http://localhost:3000";

export async function uploadPDFToDb(buffer: Buffer, filename: string, packId = "unknown", variant = "classic", dark = false, mime = "application/pdf") {
  const prisma = prismaFn();
  const sha256 = require('crypto').createHash('sha256').update(buffer).digest('hex');
  
  const rec = await prisma.mediaPackFile.create({
    data: {
      packId,
      variant,
      dark,
      mime,
      size: buffer.length,
      sha256,
      data: buffer,
    },
    select: { id: true },
  });

  const url = `${APP_URL}/api/media-pack/file/${rec.id}`;
  return { id: rec.id, url };
}

export async function createShareToken(fileId: string) {
  const prisma = prismaFn();
  const token = await prisma.mediaPackShareToken.create({
    data: { fileId },
    select: { token: true },
  });
  const url = `${APP_URL}/media-pack/share/${token.token}`;
  return { token: token.token, url };
}
