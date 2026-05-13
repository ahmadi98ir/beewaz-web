#!/bin/sh
# Fix permissions on the uploads volume (runs as root before switching to nextjs)
mkdir -p /app/public/uploads/products
chown -R nextjs:nodejs /app/public/uploads
exec su-exec nextjs node server.js