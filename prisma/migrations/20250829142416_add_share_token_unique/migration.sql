/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `MediaPack` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MediaPack_shareToken_key" ON "public"."MediaPack"("shareToken");
