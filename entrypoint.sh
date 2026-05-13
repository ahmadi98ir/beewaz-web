#!/bin/sh
mkdir -p /app/public/uploads/products
chown -R nextjs:nodejs /app/public/uploads
exec su-exec nextjs node server.js
