# Deployment Checklist - Go Live in 15 Minutes

## PRE-DEPLOYMENT (5 minutes)

### Git Setup
- [ ] Create GitHub account (if not already)
- [ ] Initialize GitHub repository for this project
  ```bash
  cd /Users/tatacheriyo/Documents/onne
  git init
  git add .
  git commit -m "Initial commit: novel platform with 90-day plan, pitch tracking, and funding"
  git remote add origin https://github.com/YOUR_USERNAME/onne.git
  git branch -M main
  git push -u origin main
  ```

### Create Accounts (FREE)
- [ ] Render.com account (backend hosting) - https://render.com
- [ ] Vercel account (frontend hosting) - https://vercel.com
- [ ] Connect GitHub to both platforms during signup

---

## DEPLOYMENT PHASE 1: BACKEND (5 minutes)

### Deploy on Render.com

1. **Login to render.com**
   - Use GitHub to sign in

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Select your GitHub repository (`onne`)
   - Click "Connect"

3. **Configure Service**
   - Name: `onne-api`
   - Root directory: `novel-api`
   - Runtime: `Node`
   - Build command: `npm install`
   - Start command: `node server.js`
   - Instance type: **Free** (important!)
   - Click "Create Web Service"

4. **Wait for deployment** (2-3 minutes)
   - Watch logs to confirm: "Novel API → http://localhost:3001"
   - Once deployed, you'll get a URL like: `https://onne-api.onrender.com`

5. **Copy your Render URL**
   - Save it: `https://onne-api.onrender.com` (you'll need this for frontend)

✅ **Backend is LIVE**

---

## DEPLOYMENT PHASE 2: FRONTEND (5 minutes)

### Deploy on Vercel.com

1. **Login to vercel.com**
   - Use GitHub to sign in

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your `onne` repository
   - Click "Import"

3. **Configure Project**
   - Framework: `Angular`
   - Root directory: `novel-ui`
   - Build command: `ng build --configuration production`
   - Output directory: `dist/novel-ui`
   - Installation command: `npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add new variable:
     - Name: `API_URL`
     - Value: `https://onne-api.onrender.com` (from Render)
     - Environments: Select "Production"
   - Click "Save"

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Once complete, you'll get a URL like: `https://onne.vercel.app`

✅ **Frontend is LIVE**

---

## DEPLOYMENT PHASE 3: LANDING PAGE (2 minutes)

### Deploy on Vercel.com (same account)

1. **Import Another Project**
   - Click "Add New" → "Project"
   - Select your `onne` repository again (we'll select a different path)

2. **Configure Landing Page**
   - Root directory: `site`
   - No build command needed
   - Output directory: `.`

3. **Deploy**
   - Click "Deploy"
   - Wait 1 minute
   - You'll get a URL like: `https://site-onne.vercel.app` or similar

✅ **Landing Page is LIVE**

---

## POST-DEPLOYMENT VERIFICATION (5 minutes)

### Test Backend API
```bash
# In terminal, run:
curl https://onne-api.onrender.com/api/plan90

# Should return JSON data like:
# {"meta":{"start_date":"2026-05-20",...}}
```

### Test Frontend
- Open `https://onne.vercel.app` in browser
- Navigate to "90-Day Plan" tab
- Should load without errors

### Test Data Persistence
1. Go to the app
2. Add a new activity log entry
3. Refresh the page
4. Entry should still be there (NeDB persisting)

---

## YOUR LIVE URLS

Save these:

```
Backend API:  https://onne-api.onrender.com
Frontend:     https://onne.vercel.app
Landing Page: https://site-onne.vercel.app
```

---

## OPTIONAL: CUSTOM DOMAIN (Later)

If you want `https://thepresident.com` instead of `vercel.app`:

**For Vercel (Frontend)**
1. Go to Vercel dashboard
2. Select your project
3. Settings → Domains
4. Add custom domain
5. Update DNS at your domain registrar

**For Render (Backend)**
1. Go to Render dashboard
2. Select your API service
3. Settings → Custom Domain
4. Same process

Cost: Depends on domain registrar ($5-15/year)

---

## MONITORING & LOGS

### View Backend Logs
- Render dashboard → Services → onne-api → Logs
- Check here if API is returning errors

### View Frontend Logs
- Vercel dashboard → Deployments
- Check "Build Logs" if deployment failed

### View NeDB Data Storage
- Render dashboard → Services → onne-api → Disks
- Shows disk usage (should be <10MB)

---

## TROUBLESHOOTING

### Problem: Frontend shows "Cannot connect to API"
**Solution:**
1. Check Render backend is running (view logs)
2. Verify `API_URL` env var in Vercel is correct
3. Redeploy frontend (Vercel → Deployments → Redeploy)

### Problem: Render shows "error: Cannot find module"
**Solution:**
1. Check `novel-api/package.json` has all dependencies
2. Check Build command is `npm install`
3. Check Node version (should be latest)

### Problem: Data not persisting after refresh
**Solution:**
1. Check Render has disk enabled (render.yaml should be in root)
2. Check `/app/onne-db` is mounted (Render dashboard → Disks)
3. Redeploy from Render dashboard

### Problem: Cold start takes 30+ seconds
**Normal on free tier.** After first request, subsequent requests are instant.

---

## PHASE 2: MIGRATION TO MONGODB (Later)

When you're ready to migrate from local NeDB to MongoDB:

1. Create MongoDB Atlas account (free)
2. I'll provide migration script
3. Update `db.js` to use MongoDB instead of NeDB
4. Redeploy
5. Delete local database files

**No downtime. Automatic. Zero data loss.**

---

## CELEBRATION 🎉

You now have:
- ✅ Live backend API (`https://onne-api.onrender.com`)
- ✅ Live frontend app (`https://onne.vercel.app`)
- ✅ Live landing page (`https://site-onne.vercel.app`)
- ✅ Persistent NeDB database
- ✅ Free hosting ($0/month)

**Share your URLs with stakeholders!**

---

## NEXT STEPS (After Go-Live)

1. **Test in production** (1-2 days)
   - Try all features
   - Check mobile responsiveness
   - Test data saving

2. **Gather feedback** (1 week)
   - Ask users for issues
   - Fix any bugs

3. **Consider upgrades** (After validation)
   - Paid Render tier if you hit limits
   - Custom domain
   - MongoDB Atlas for more data

4. **Campaign launch** (When ready)
   - Share landing page
   - Start crowdfunding
   - Pitch to publishers

---

## TIMELINE

- **Today**: Deploy (15 minutes)
- **This week**: Test & iterate
- **Next week**: Start pitching
- **Month 2**: Run crowdfunding campaign
- **Month 3**: Migrate to production database (optional)

**Good luck! 🚀**
