#!/bin/sh
set -e

# Run prisma db push to ensure database schema is in sync
if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Ensuring database schema is synced with Prisma..."
  npx prisma db push --schema=packages/server/prisma/schema.prisma --skip-generate || echo "⚠️ Warning: prisma db push failed, proceeding..."
fi

exec "$@"
