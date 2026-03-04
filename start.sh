#!/bin/sh
# Wait for DB to be absolutely ready before pushing schema.
# The docker-compose healthcheck usually handles this, but it's good practice.

echo "Pushing database schema to PostgreSQL..."
npx prisma db push --accept-data-loss

echo "Starting Analytics Dashboard..."
exec node server.js
