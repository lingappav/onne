#!/bin/bash

# QUICK START DEPLOYMENT SCRIPT
# This script prepares your code for deployment to Render + Vercel

echo "🚀 ONNE - Quick Start Deployment"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
  echo "❌ Not a git repository. Initializing..."
  git init
  git config user.name "Author"
  git config user.email "author@example.com"
else
  echo "✅ Git repository found"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Backend dependencies
echo "Installing backend dependencies..."
cd novel-api
npm install
cd ..

# Frontend dependencies
echo "Installing frontend dependencies..."
cd novel-ui
npm install
cd ..

echo ""
echo "✅ Dependencies installed"
echo ""

echo "📝 Adding all files to git..."
git add .
git commit -m "Initial commit: Deploy-ready code with NeDB persistence"

echo ""
echo "🌐 NEXT STEPS:"
echo "=============="
echo ""
echo "1. Create GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Name: onne"
echo "   - Click 'Create repository'"
echo ""
echo "2. Push code to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/onne.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy backend (Render):"
echo "   - Go to https://render.com"
echo "   - Login with GitHub"
echo "   - Click 'New' → 'Web Service'"
echo "   - Connect your 'onne' repository"
echo "   - Root directory: novel-api"
echo "   - Build: npm install"
echo "   - Start: node server.js"
echo "   - Instance: Free"
echo "   - Create Web Service"
echo ""
echo "4. Deploy frontend (Vercel):"
echo "   - Go to https://vercel.com"
echo "   - Login with GitHub"
echo "   - Click 'Add New' → 'Project'"
echo "   - Select 'onne' repository"
echo "   - Framework: Angular"
echo "   - Root: novel-ui"
echo "   - Add env var: API_URL = https://onne-api.onrender.com"
echo "   - Deploy"
echo ""
echo "5. Deploy landing page (Vercel):"
echo "   - Click 'Add New' → 'Project'"
echo "   - Same repository"
echo "   - Root: site"
echo "   - Deploy"
echo ""
echo "📖 Full guide: See DEPLOY_CHECKLIST.md"
echo ""
echo "✅ Ready to deploy! 🎉"
