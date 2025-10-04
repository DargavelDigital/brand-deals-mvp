-- Delete all PDF files from the database
DELETE FROM "MediaPackFile";

-- Optionally delete MediaPack records too (uncomment if needed)
-- DELETE FROM "MediaPack";

-- Show count of remaining records
SELECT COUNT(*) as remaining_pdf_files FROM "MediaPackFile";
SELECT COUNT(*) as remaining_media_packs FROM "MediaPack";
