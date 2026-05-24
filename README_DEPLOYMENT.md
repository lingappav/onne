# 🚀 ONNE - Deployment Guide

**Your complete guide to deploying the novel platform for free and going live in 15 minutes.**

---

## 📋 WHAT'S INCLUDED

This package contains everything needed to:
1. Deploy backend API (Node.js) to Render (FREE)
2. Deploy frontend app (Angular) to Vercel (FREE)
3. Deploy landing page (HTML) to Vercel (FREE)
4. Store data in local NeDB (FREE)
5. Later migrate to MongoDB (FREE tier available)

**Total cost: $0/month**

---

## 🎯 QUICK START (15 minutes)

### Step 1: Read the checklist
```
Open: DEPLOY_CHECKLIST.md
Time: 5 minutes
```

### Step 2: Deploy backend (Render)
```
1. Go to render.com
2. Login with GitHub
3. Create Web Service
4. Configure as per checklist
5. Wait 2-3 minutes
Time: 5 minutes total
```

### Step 3: Deploy frontend (Vercel)
```
1. Go to vercel.com
2. Login with GitHub
3. Import project
4. Configure as per checklist
5. Wait 2-3 minutes
Time: 5 minutes total
```

### Step 4: Verify everything works
```
Open: POST_DEPLOYMENT_TESTS.md
Time: 5 minutes
```

**Total: ~15 minutes to go live**

---

## 📚 DOCUMENTATION FILES

### Essential (Read in order)
1. **DEPLOY_CHECKLIST.md** ← START HERE
   - Step-by-step deployment instructions
   - Copy-paste commands
   - Troubleshooting guide
   - Expected results

### Understanding Architecture
2. **DEPLOYMENT_GUIDE.md**
   - Why this approach?
   - Phase 1 vs Phase 2
   - Cost breakdown
   - Scaling strategy

3. **ARCHITECTURE.md**
   - Visual diagrams
   - Data flow
   - Network architecture
   - Scaling path

### After Deployment
4. **POST_DEPLOYMENT_TESTS.md**
   - How to verify everything works
   - Test checklist
   - Troubleshooting if issues arise

### Future Planning
5. **DATABASE_MIGRATION_GUIDE.md**
   - When to migrate from NeDB to MongoDB
   - How to migrate (zero downtime)
   - What changes in code
   - Rollback plan

### Quick Reference
6. **QUICK_START.sh**
   - Automated setup script
   - Installs dependencies
   - Prepares for deployment

---

## 🏗️ ARCHITECTURE OVERVIEW

### Your Users See:
```
https://onne.vercel.app  ← Frontend app (Angular)
https://site-onne.vercel.app  ← Landing page (HTML)
```

### Behind the Scenes:
```
https://onne-api.onrender.com  ← Backend API (Node.js)
    ↓
    └─→ NeDB Database (Render persistent disk)
```

**All running on free tiers. Completely scalable.**

---

## 💰 COST BREAKDOWN

| Component | Provider | Cost | Limit |
|-----------|----------|------|-------|
| Backend API | Render | FREE | 512MB RAM |
| Frontend App | Vercel | FREE | Unlimited bandwidth |
| Landing Page | Vercel | FREE | Unlimited |
| Database | NeDB on Render | FREE | 1GB disk |
| **TOTAL** | | **$0/month** | Perfect for MVP |

**Upgrade path available when you hit limits (very unlikely for a novel platform).**

---

## 🗂️ YOUR LIVE URLS (After Deployment)

```
Frontend:  https://onne.vercel.app
Landing:   https://site-onne.vercel.app
Backend:   https://onne-api.onrender.com
```

Replace with custom domains later ($5-15/year).

---

## 🔄 CURRENT TECH STACK

**Frontend**
- Angular 17
- TypeScript
- Angular Material
- RxJS
- Standalone components

**Backend**
- Node.js + Express
- NeDB (local NoSQL)
- REST API

**Database**
- Phase 1: NeDB (file-based)
- Phase 2: MongoDB Atlas (cloud)

**Hosting**
- Phase 1: Render (backend) + Vercel (frontend)
- Phase 2: Same, but with MongoDB

---

## 📖 RECOMMENDED READING ORDER

**If deploying NOW:**
1. DEPLOY_CHECKLIST.md (follow exact steps)
2. POST_DEPLOYMENT_TESTS.md (verify it works)
3. ARCHITECTURE.md (understand what just happened)

**If understanding first:**
1. DEPLOYMENT_GUIDE.md (overview)
2. ARCHITECTURE.md (visual explanations)
3. DEPLOY_CHECKLIST.md (actual steps)
4. POST_DEPLOYMENT_TESTS.md (verify)

**For future planning:**
1. DATABASE_MIGRATION_GUIDE.md (when upgrading databases)

---

## ✅ BEFORE YOU START

Have these ready:
- [ ] GitHub account
- [ ] Render account (or sign up during deploy)
- [ ] Vercel account (or sign up during deploy)
- [ ] Code pushed to GitHub
- [ ] 15 minutes of uninterrupted time

---

## 🎯 THREE PHASES

### Phase 1 (NOW): MVP Deployment
- Deploy with local NeDB
- Zero infrastructure cost
- Perfect for testing
- Timeline: Today

### Phase 2 (MONTH 2-3): Production Ready
- Migrate to MongoDB Atlas
- Add monitoring
- Set up custom domain
- Timeline: After validation

### Phase 3 (MONTH 6+): Scaling
- Upgrade to paid tiers if needed
- Add team members
- Add authentication
- Timeline: Only if successful

---

## 🚀 DEPLOYMENT TIMELINE

```
TODAY (Week 1)
├─ Prepare code (2 min)
├─ Deploy backend (5 min)
├─ Deploy frontend (5 min)
├─ Test (5 min)
└─ ✅ LIVE

WEEK 1-2
├─ Test all features
├─ Gather feedback
└─ Fix bugs

WEEK 2-3
├─ Share with stakeholders
├─ Start pitching
└─ Collect feedback

MONTH 2-3
└─ Upgrade to MongoDB (optional)

MONTH 3+
└─ Launch crowdfunding campaign
```

---

## 🆘 HELP & TROUBLESHOOTING

### Common Issues Covered In:
- **"I don't understand the setup"** → ARCHITECTURE.md
- **"How do I deploy exactly?"** → DEPLOY_CHECKLIST.md
- **"Something isn't working"** → POST_DEPLOYMENT_TESTS.md
- **"When should I upgrade?"** → DEPLOYMENT_GUIDE.md
- **"I want my own database"** → DATABASE_MIGRATION_GUIDE.md

### External Resources:
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- Angular docs: https://angular.io/docs
- NeDB docs: https://github.com/seald-io/nedb

---

## 🎉 WHAT HAPPENS NEXT

### Immediately After Deploy
1. Test all features
2. Verify data persists
3. Check performance
4. Share URLs with stakeholders

### Week 1-2
1. Gather feedback
2. Fix bugs
3. Test on mobile
4. Document any issues

### Week 2-3
1. Pitch to publishers
2. Share landing page
3. Collect feedback
4. Iterate

### Month 2-3
1. Plan crowdfunding campaign
2. Migrate database if needed
3. Scale if successful
4. Start campaign

---

## 🔐 SECURITY & DATA

**Current state:**
- ✅ All HTTPS (Vercel & Render default)
- ✅ No sensitive data in code
- ✅ CORS configured correctly
- ✅ Database files not exposed
- ✅ `master_novel.json` is read-only

**After MongoDB migration:**
- ✅ Add authentication
- ✅ Encrypt sensitive fields
- ✅ Add API rate limiting
- ✅ Automatic backups

---

## 📊 MONITORING

### Check these regularly:
1. **Render dashboard**
   - Service status
   - Error logs
   - Disk usage

2. **Vercel dashboard**
   - Deployment status
   - Build logs
   - Analytics

3. **Your app**
   - Try creating data
   - Refresh to verify persistence
   - Check all tabs work

### Set alerts for:
- Backend crashes
- High error rates
- Disk space issues

---

## 🎯 SUCCESS CRITERIA

Your deployment is successful when:

- [ ] Backend API responds (test with curl)
- [ ] Frontend loads without errors
- [ ] Can add activity and data persists
- [ ] All tabs/features load
- [ ] Mobile view works
- [ ] Landing page displays
- [ ] No console errors
- [ ] Render shows green status
- [ ] Vercel shows green status

---

## 📞 NEED HELP?

### During Deployment
1. Read DEPLOY_CHECKLIST.md thoroughly
2. Follow each step exactly
3. Check POST_DEPLOYMENT_TESTS.md if something fails
4. Read the troubleshooting section

### After Deployment
1. Run all tests in POST_DEPLOYMENT_TESTS.md
2. Check logs in Render & Vercel dashboards
3. Verify data persists by adding/refreshing

### Architecture Questions
1. See ARCHITECTURE.md
2. See DEPLOYMENT_GUIDE.md

### Database Migration (Later)
1. See DATABASE_MIGRATION_GUIDE.md
2. Timeline: Month 2-3

---

## 🎓 LEARN MORE

### About Render
- Free tier limits: 512MB RAM, 0.5 CPU
- Perfect for: Development, testing, low-traffic apps
- Upgrade: $5-50/month for more power

### About Vercel
- Free tier limits: Unlimited bandwidth, deployments
- Perfect for: Production frontend apps
- Upgrade: $20/month for extra features

### About NeDB
- Local: Perfect for single-user, testing
- No scaling limits for small data
- Upgrade path: MongoDB or PostgreSQL

---

## 🏁 LET'S GO LIVE!

Everything is ready. Pick a time today:

1. **Create accounts** (2 min)
   - GitHub (if needed)
   - Render account (free)
   - Vercel account (free)

2. **Follow checklist** (15 min)
   - DEPLOY_CHECKLIST.md
   - Copy-paste commands
   - Wait for builds

3. **Test** (5 min)
   - POST_DEPLOYMENT_TESTS.md
   - Verify everything works

4. **Celebrate!** 🎉
   - You're live!
   - Share with stakeholders
   - Start pitching

---

## 📋 FINAL CHECKLIST

Before you start deployment:

- [ ] Code is committed to git
- [ ] GitHub repo is public
- [ ] No secrets in code
- [ ] Have Render account ready
- [ ] Have Vercel account ready
- [ ] Have 15 minutes free time
- [ ] DEPLOY_CHECKLIST.md is open
- [ ] Phone/browser ready for testing

---

**Ready? Let's make this novel live! 🚀**

**Start here → DEPLOY_CHECKLIST.md**

---

## 📄 ALL FILES IN THIS PACKAGE

```
DEPLOYMENT GUIDES:
├── DEPLOY_CHECKLIST.md          ← COPY-PASTE INSTRUCTIONS
├── DEPLOYMENT_GUIDE.md          ← DETAILED STRATEGY
├── ARCHITECTURE.md              ← VISUAL DIAGRAMS
├── POST_DEPLOYMENT_TESTS.md     ← VERIFICATION STEPS
├── DATABASE_MIGRATION_GUIDE.md  ← FUTURE PLANNING

SETUP & CONFIG:
├── QUICK_START.sh               ← AUTOMATED SETUP
├── render.yaml                  ← RENDER CONFIGURATION
├── novel-ui/src/environments/   ← ANGULAR CONFIG

HELPFUL REFERENCES:
├── README_DEPLOYMENT.md         ← THIS FILE
└── DEPLOYMENT_SUMMARY.md        ← QUICK REFERENCE
```

---

## 🎯 YOUR NEXT STEP

**Open DEPLOY_CHECKLIST.md and follow the steps.**

That's it. You've got this! 🚀
