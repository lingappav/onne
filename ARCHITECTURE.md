# Architecture Diagram & Deployment Flow

## Current Local Architecture (Dev)

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR LAPTOP                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Browser         │◄────────│ Angular Frontend │     │
│  │ localhost:4200   │         │ Dev Server       │     │
│  └──────────────────┘         └──────────────────┘     │
│           │                            │                │
│           └────────────────┬───────────┘                │
│                            │                            │
│                   HTTP Requests (Port 3001)             │
│                            │                            │
│                    ┌───────▼──────────┐                │
│                    │  Node.js Server  │                │
│                    │  localhost:3001  │                │
│                    └───────┬──────────┘                │
│                            │                            │
│                    ┌───────▼──────────┐                │
│                    │  NeDB Database   │                │
│                    │  /data/db/*.db   │                │
│                    └──────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## Deployed Architecture - PHASE 1 (Free, Now)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET / USERS                             │
└────┬──────────────────────────────────┬───────────────────────┬─────┘
     │                                  │                       │
     │                                  │                       │
     ▼                                  ▼                       ▼
┌──────────────────┐    ┌───────────────────────┐   ┌──────────────────┐
│   LANDING PAGE   │    │   FRONTEND APP        │   │  BACKEND API     │
│                  │    │                       │   │                  │
│  Vercel          │    │  Vercel               │   │  Render          │
│  (Static HTML)   │    │  (Angular SPA)        │   │  (Node.js)       │
│                  │    │                       │   │                  │
│  site/           │    │  novel-ui/            │   │  novel-api/      │
│  index.html      │    │  dist/novel-ui        │   │  server.js       │
│                  │    │                       │   │                  │
│  URL:            │    │  URL:                 │   │  URL:            │
│  site.vercel.app │    │  onne.vercel.app      │   │  onne-api.       │
│                  │    │                       │   │  onrender.com    │
└──────────────────┘    └───────────┬───────────┘   └────────┬─────────┘
                                    │                        │
                        Fetches data │                        │
                                    │                        │
                        ┌───────────┴────────────────────────┘
                        │
                        │ HTTP REST API
                        │
                        ▼
                ┌──────────────────────┐
                │  PERSISTENT STORAGE  │
                │                      │
                │  Render Disk         │
                │  /app/onne-db/       │
                │  - pitches.db        │
                │  - film_agreement.db │
                │  - tasks.db          │
                │  - plan90.db         │
                │  - activities.db     │
                └──────────────────────┘
```

**Cost: $0/month**

---

## Deployed Architecture - PHASE 2 (Production-ready, Later)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET / USERS                             │
└────┬──────────────────────────────────┬───────────────────────┬─────┘
     │                                  │                       │
     │                                  │                       │
     ▼                                  ▼                       ▼
┌──────────────────┐    ┌───────────────────────┐   ┌──────────────────┐
│   LANDING PAGE   │    │   FRONTEND APP        │   │  BACKEND API     │
│                  │    │                       │   │                  │
│  Vercel          │    │  Vercel               │   │  Render          │
│  (Static HTML)   │    │  (Angular SPA)        │   │  (Node.js)       │
│                  │    │                       │   │                  │
│  🆓 FREE          │    │  🆓 FREE               │   │  🆓 FREE          │
└──────────────────┘    └───────────┬───────────┘   └────────┬─────────┘
                                    │                        │
                        Fetches data │                        │
                                    │                        │
                        ┌───────────┴────────────────────────┘
                        │
                        │ HTTP REST API + Auth
                        │
                        ▼
                ┌──────────────────────┐
                │  MONGODB ATLAS       │
                │                      │
                │  Cloud Database      │
                │  - 512MB free tier   │
                │  - Automatic backups │
                │  - Georeplicated     │
                │                      │
                │  cluster0.mongodb..  │
                │  net/onne            │
                └──────────────────────┘
```

**Cost: $0/month** (or $57/month if upgrading storage)

---

## Data Flow

### Create/Update Flow
```
User Action (Frontend)
        │
        ▼
┌──────────────────────┐
│ Angular Component    │
│ (e.g., Plan90)       │
└──────────┬───────────┘
           │
      HTTP PATCH/POST
           │
           ▼
┌──────────────────────┐
│ API Endpoint         │
│ /api/plan90/activity │
└──────────┬───────────┘
           │
      Validate & Save
           │
           ▼
┌──────────────────────┐
│ Database             │
│ (NeDB or MongoDB)    │
└──────────┬───────────┘
           │
         SAVED ✓
```

### Read Flow
```
User Opens App
       │
       ▼
Angular loads component
       │
       ▼
HTTP GET /api/plan90
       │
       ▼
Database Query
       │
       ▼
JSON Response
       │
       ▼
Display in UI ✓
```

---

## File Structure After Deployment

```
onne/  (GitHub repository)
├── novel-api/           → Deployed to Render
│   ├── server.js
│   ├── db.js            → Uses Render persistent disk
│   ├── package.json
│   └── ...
│
├── novel-ui/            → Deployed to Vercel
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
│
├── site/                → Deployed to Vercel
│   └── index.html       → Landing page
│
├── render.yaml          → Render configuration
├── DEPLOY_CHECKLIST.md
├── DEPLOYMENT_GUIDE.md
└── ...
```

---

## Data Persistence Strategy

### PHASE 1: NeDB (Local Files)
```
Render Persistent Disk
    │
    ├── /app/onne-db/
    │   ├── pitches.db           (Pitch status tracking)
    │   ├── film_agreement.db    (Sunday Cinemas milestones)
    │   ├── tasks.db             (Copywriting tasks)
    │   ├── plan90.db            (90-day plan chapters & milestones)
    │   └── activities.db        (Daily activity logs)
    │
    └── Persists across:
        ✓ Server restarts
        ✓ Deployments
        ✓ Render updates
```

### PHASE 2: MongoDB (Cloud)
```
MongoDB Atlas (Cloud)
    │
    ├── Database: "onne"
    │   ├── pitches          (Pitch status tracking)
    │   ├── film_agreement   (Sunday Cinemas milestones)
    │   ├── tasks            (Copywriting tasks)
    │   ├── plan90           (90-day plan chapters & milestones)
    │   └── activities       (Daily activity logs)
    │
    ├── Automatic backups    (Daily)
    ├── Replication          (3x geographic redundancy)
    └── Persists across:
        ✓ All of Phase 1
        ✓ Multiple servers
        ✓ Geographic failures
```

---

## Environment Configuration

### Development (Local)
```
API_URL = http://localhost:3001
DATABASE = Local NeDB files
NODE_ENV = development
```

### Production Phase 1 (Render + Vercel)
```
Frontend (Vercel):
  API_URL = https://onne-api.onrender.com
  NODE_ENV = production

Backend (Render):
  NODE_ENV = production
  DATABASE = Render persistent disk /app/onne-db/
```

### Production Phase 2 (MongoDB)
```
Frontend (same as Phase 1):
  API_URL = https://onne-api.onrender.com
  NODE_ENV = production

Backend (Render):
  NODE_ENV = production
  MONGO_URI = mongodb+srv://user:pass@cluster.mongodb.net/onne
  DATABASE = MongoDB Atlas
```

---

## Network Diagram

```
                        INTERNET
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
         (DNS resolves to IP addresses)
              │            │            │
              ▼            ▼            ▼
          Vercel      Render       MongoDB
         (Frontend)   (Backend)    (Database)
              │            │            │
         ┌────┴────┬───────┴──────┬────┘
         │         │              │
    CDN  │    REST │              │
    HQ   │    API  │         Query │
         │         │              │
         └─────────────────────────┘
              Browser
           (Your User)
```

---

## Deployment Timeline

```
WEEK 1 - SETUP
├─ Day 1: Read DEPLOY_CHECKLIST.md
├─ Day 2: Deploy backend (Render) - 5 min
├─ Day 3: Deploy frontend (Vercel) - 5 min
├─ Day 4: Deploy landing page - 2 min
├─ Day 5-7: Test & iterate
└─ Status: ✅ LIVE on https://onne.vercel.app

WEEK 2-3 - VALIDATE
├─ Test all features
├─ Gather feedback
├─ Fix bugs
└─ Status: ✅ STABLE

MONTH 2-3 - OPTIMIZE (Optional)
├─ Migrate to MongoDB if needed
├─ Set up custom domain
├─ Add monitoring
└─ Status: ✅ READY TO SCALE

MONTH 3+ - CAMPAIGN
├─ Launch crowdfunding
├─ Pitch to publishers
├─ Scale infrastructure
└─ Status: 🚀 GROWING
```

---

## Scaling Path (Future)

```
Phase 1 (FREE)              Phase 2 (FREE)              Phase 3 (PAID)
├─ Render free tier         ├─ Render free tier         ├─ Render $5/mo
├─ Vercel free tier         ├─ Vercel free tier         ├─ Vercel free tier
├─ NeDB local               ├─ MongoDB Atlas free       ├─ MongoDB Atlas $57+/mo
├─ 1 concurrent user        ├─ 5-10 concurrent users    ├─ 100+ concurrent users
├─ < 10MB storage           ├─ < 512MB storage          ├─ > 5GB storage
└─ Cost: $0/month           └─ Cost: $0/month           └─ Cost: $62+/month

→ No breaking changes       → No code changes           → Database migration only
→ Add features freely       → Add team members          → Global scaling
→ Perfect MVP               → Team collaboration        → Enterprise grade
```

---

## Quick Reference: Where Things Run

| Component | Hosted On | URL | Cost |
|-----------|-----------|-----|------|
| Frontend App | Vercel | onne.vercel.app | FREE |
| Landing Page | Vercel | site.vercel.app | FREE |
| Backend API | Render | onne-api.onrender.com | FREE |
| Database | Render Disk (P1) or MongoDB (P2) | onne-api → /app/onne-db/ | FREE |
| Domain (Optional) | Your registrar | yourname.com | $5-15/year |
| **TOTAL** | | | **$0/month** |

---

## Performance Expectations

| Metric | Phase 1 (NeDB) | Phase 2 (MongoDB) |
|--------|---|---|
| API Response | 50-200ms | 50-300ms |
| Cold Start | 30s (free tier) | 30s (free tier) |
| Warm Request | 200ms | 200ms |
| Data Sync | Real-time | Real-time |
| Uptime | 99.5% | 99.95% |
| Backups | Manual | Automatic |

---

**Your app is ready to scale. Choose your own pace. 🚀**
