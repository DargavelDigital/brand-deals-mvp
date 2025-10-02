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

export async function uploadPDFToDb(buffer: Buffer, filename: string, mime = "application/pdf") {
  const prisma = prismaFn();
  const rec = await prisma.mediaPackFile.create({
    data: {
      packId: "unknown", // caller should update real packId later if needed
      filename,
      mimeType: mime,
      size: buffer.length,
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
