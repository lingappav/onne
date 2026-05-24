# Deployment Guide: Free Hosting + Database Strategy

## Overview
This guide covers:
1. **Phase 1 (NOW)**: Free hosting with local NeDB database
2. **Phase 2 (LATER)**: Migration to cloud database (MongoDB/PostgreSQL)

---

## PHASE 1: FREE HOSTING WITH LOCAL NEDB

### Option A: Render.com (RECOMMENDED - Free Tier with NeDB)

**Backend Deployment (Node.js API)**

1. **Prepare your repository**
   ```bash
   cd /Users/tatacheriyo/Documents/onne
   git add novel-api/
   git commit -m "Deployment: prepare Node.js backend for Render"
   git push origin main
   ```

2. **Create Render account**
   - Go to https://render.com (free)
   - Sign up with GitHub
   - Connect your repository

3. **Create new Web Service**
   - Click "New" → "Web Service"
   - Select your repository
   - Root directory: `novel-api`
   - Build command: `npm install`
   - Start command: `node server.js`
   - Environment: `Node`
   - Instance type: **Free** ($0/month)
   
4. **Add environment variables**
   - `NODE_ENV`: `production`
   - `PORT`: `3001` (Render assigns this automatically)

5. **Expected result**
   - Your API will be live at: `https://<your-service-name>.onrender.com`
   - NeDB database files persist in `/data` directory (Render's persistent disk)

**Frontend Deployment (Angular App)**

1. **Build Angular app**
   ```bash
   cd novel-ui
   ng build --configuration production
   ```

2. **Deploy to Vercel (FREE)**
   - Go to https://vercel.com (free)
   - Import repository from GitHub
   - Framework: `Angular`
   - Build command: `ng build --configuration production`
   - Output directory: `dist/novel-ui`
   - Environment variables:
     - `API_URL`: `https://<your-render-service>.onrender.com`

3. **Alternative: Netlify (FREE)**
   - Go to https://netlify.com
   - Connect GitHub repository
   - Build command: `npm run build:prod`
   - Publish directory: `dist/novel-ui`
   - Environment: Same API_URL

**Landing Page (Static HTML)**

1. **Deploy to Vercel/Netlify (both FREE)**
   ```bash
   # Create separate deploy folder for /site
   mkdir site-deploy
   cp site/index.html site-deploy/
   cp site/style.css site-deploy/ (if exists)
   ```
   - Vercel: Create new project → select `/site` folder
   - Netlify: Drag & drop `/site` folder
   - No build step needed (pure HTML)

---

## PHASE 2: MIGRATION TO CLOUD DATABASE (When Ready)

### Option 1: MongoDB Atlas (Free Tier - Recommended)

**Why MongoDB?**
- Free tier: 512MB storage
- Perfect for document-based data (like your current NeDB structure)
- Zero setup complexity
- Seamless migration from NeDB

**Steps:**

1. **Create MongoDB Atlas account**
   - Go to https://www.mongodb.com/cloud/atlas (free)
   - Sign up
   - Create free cluster (takes ~3 minutes)
   - Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/database`

2. **Modify `/novel-api/db.js`**
   ```javascript
   // Add at top
   const mongoose = require('mongoose');
   const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://user:pass@cluster.mongodb.net/onne';
   
   // Connect to MongoDB
   mongoose.connect(MONGO_URI, { useNewUrlParser: true });
   
   // Replace NeDB datastores with Mongoose models
   const PlanSchema = new mongoose.Schema({ /* ... */ });
   const ActivitySchema = new mongoose.Schema({ /* ... */ });
   // etc.
   ```

3. **Export Render's NeDB data to MongoDB**
   - Get database files from Render's persistent disk
   - Use migration script to export and import
   - (I can write this for you when ready)

4. **Update API endpoints** (minimal changes)
   - Replace `planDb.find()` with `PlanModel.find()`
   - Replace `planDb.update()` with `PlanModel.updateOne()`
   - All logic stays the same

---

## PHASE 1 QUICK START (RECOMMENDED)

### Step-by-Step for Render + Vercel

**Backend (5 minutes)**
```bash
# 1. Push your code
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to render.com
# 3. Create Web Service from your repo
# 4. Set root dir: novel-api
# 5. Build: npm install
# 6. Start: node server.js
# 7. Copy your render URL
```

**Frontend (5 minutes)**
```bash
# 1. Go to vercel.com
# 2. Import GitHub repo
# 3. Framework: Angular
# 4. Set env var API_URL = your render URL
# 5. Deploy
```

**Landing Page (2 minutes)**
```bash
# 1. Go to vercel.com or netlify.com
# 2. Create new project
# 3. Select /site folder
# 4. Deploy
```

**Total setup time: ~15 minutes**

---

## COSTS & LIMITATIONS

### Phase 1 (Current)
- **Backend (Render)**: Free - $0/month
  - Limited: 512MB RAM, 0.5 CPU
  - Cold starts: ~30 seconds after inactivity
  - Perfect for: Development, testing, low traffic
  
- **Frontend (Vercel/Netlify)**: Free - $0/month
  - Unlimited bandwidth
  - Perfect for: Production
  
- **Landing Page**: Free - $0/month

- **Database (Local NeDB)**: Free - $0/month
  - Stored on Render's persistent disk
  - No external charges

**Total Cost: $0/month**

### Phase 2 (Later)
- **Backend**: Free - $0/month (same Render)
- **Frontend**: Free - $0/month (same Vercel)
- **Database (MongoDB)**: Free - $0/month
  - 512MB storage (enough for ~100K documents)
  - If you need more: $57/month for 5GB

**Total Cost: Still $0/month** (can scale to $57+ later if needed)

---

## MONITORING & TROUBLESHOOTING

### View Render logs
```
Render Dashboard → Services → Your service → Logs
```

### View deployment status
```
Vercel/Netlify Dashboard → Deployments tab
```

### Common issues

**Issue: API calls returning 404**
- Check `API_URL` env var in frontend
- Verify Render service is running (check logs)
- CORS enabled in server.js? ✓ (already done)

**Issue: NeDB files not persisting**
- Render needs explicit `/data` mount
- Add to `render.yaml` (see config file below)

**Issue: Frontend can't reach backend**
- Check API_URL matches your Render service URL
- Ensure no trailing slash: `https://service.onrender.com` (not `.../`)

---

## RENDER.YAML CONFIGURATION (For Persistent NeDB)

Create `/render.yaml` in root of your repo:

```yaml
services:
  - type: web
    name: onne-api
    runtime: node
    rootDir: novel-api
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
    disk:
      name: data
      mountPath: /data
      sizeGB: 1
```

This ensures NeDB files persist across deployments.

---

## MIGRATION CHECKLIST (Phase 1 → Phase 2)

When you're ready to move to cloud database:

- [ ] Decide on MongoDB, PostgreSQL, or another database
- [ ] Export NeDB data (I'll provide export script)
- [ ] Create cloud database account
- [ ] Update db.js with cloud connection
- [ ] Test all endpoints
- [ ] Update Render env variables
- [ ] Verify data persists
- [ ] Delete local NeDB files

---

## RECOMMENDED PATH

**Week 1 (Now)**: Deploy Phase 1
- API on Render (free tier)
- Frontend on Vercel
- Landing page on Vercel
- NeDB local database

**Month 2-3 (When you have traffic)**: Upgrade to Phase 2
- Migrate to MongoDB Atlas (free tier)
- Same hosting, better scalability
- No downtime migration

**Month 6+ (If successful campaign)**: Scale
- Paid MongoDB tier ($57+/month)
- Render paid tier ($5+/month)
- CDN for static assets

---

## NEXT STEPS

1. Create Render account
2. Create Vercel account
3. Push code to GitHub
4. Deploy backend (5 min)
5. Deploy frontend (5 min)
6. Test live URLs
7. Share URLs with stakeholders

**Need help with any step? I can:**
- Create `.env.production` files
- Set up automated deployments
- Create database migration script
- Configure custom domain names
- Set up monitoring/alerts
