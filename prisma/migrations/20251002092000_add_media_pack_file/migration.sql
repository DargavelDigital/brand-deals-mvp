-- CreateTable
CREATE TABLE "MediaPackFile" (
    "id" TEXT NOT NULL,
    "packId" VARCHAR(128) NOT NULL,
    "variant" VARCHAR(32) NOT NULL,
    "dark" BOOLEAN NOT NULL DEFAULT false,
    "mime" VARCHAR(64) NOT NULL,
    "size" INTEGER NOT NULL,
    "sha256" VARCHAR(128) NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaPackFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaPackShareToken" (
    "token" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaPackShareToken_pkey" PRIMARY KEY ("token")
);

-- AddForeignKey
ALTER TABLE "MediaPackShareToken" ADD CONSTRAINT "MediaPackShareToken_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "MediaPackFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
