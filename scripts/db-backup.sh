#!/bin/bash
set -euo pipefail

STAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
echo "🔄 Starting backup at ${STAMP}"

# Create backup
pg_dump --no-owner --no-privileges --format=custom "$DATABASE_URL" -f db.dump

# Upload to S3/R2
aws s3 cp db.dump "s3://${S3_BUCKET}/pg/${STAMP}.dump" --sse AES256

echo "✅ Uploaded ${STAMP}.dump to s3://${S3_BUCKET}/pg/"

# Clean up local file
rm db.dump

echo "🎉 Backup completed successfully"
