#!/bin/bash
# Usage: DATABASE_URL=postgres://... ./scripts/restore-local.sh s3://bucket/pg/2025-01-12T02-00-00Z.dump
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 s3://bucket/pg/timestamp.dump"
  echo "Example: $0 s3://my-backups/pg/2025-01-12T02-00-00Z.dump"
  exit 1
fi

DUMP_URI=$1
echo "🔄 Restoring from $DUMP_URI..."

# Download from S3
aws s3 cp "$DUMP_URI" db.dump

# Restore to database
pg_restore --clean --if-exists -d "$DATABASE_URL" db.dump

# Cleanup
rm db.dump

echo "✅ Restored from $DUMP_URI successfully!"
echo "💡 Remember to restart your app to pick up any schema changes"
