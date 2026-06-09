#!/bin/bash
# ============================================
# Anime Club NITH - Backend Deploy Script
# Run this on your EC2 server
# ============================================

set -e  # Exit on any error

echo "🚀 Starting backend deployment..."

# 1. Pull latest code
echo "📦 Pulling latest code from GitHub..."
git pull origin main

# 2. Install dependencies
echo "📚 Installing dependencies..."
cd backend
npm install

# 3. Ensure .env has NODE_ENV=production
echo "🔧 Checking environment variables..."
if ! grep -q "NODE_ENV=production" .env; then
  echo "NODE_ENV=production" >> .env
  echo "✅ Added NODE_ENV=production to .env"
else
  echo "✅ NODE_ENV=production already set"
fi

# 4. Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# 5. Restart using PM2 (if installed), otherwise show manual steps
echo "♻️  Restarting server..."
if command -v pm2 &> /dev/null; then
  pm2 restart anime-club-backend 2>/dev/null || pm2 start dist/server.js --name anime-club-backend
  pm2 save
  echo "✅ Server restarted with PM2!"
  pm2 status
else
  echo "⚠️  PM2 not found. Install it with: npm install -g pm2"
  echo "Then run: pm2 start dist/server.js --name anime-club-backend"
fi

echo ""
echo "✅ Deployment complete!"
echo "🌐 Backend running at: http://13.202.26.208:8000"
