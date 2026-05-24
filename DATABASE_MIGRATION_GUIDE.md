# Database Migration Guide: NeDB → MongoDB/PostgreSQL

**This guide is for LATER when you need to scale beyond local NeDB.**

Currently you're using: **NeDB** (file-based, local)
Later you can migrate to: **MongoDB Atlas** (cloud, free tier 512MB)

---

## WHY MIGRATE?

**Current (NeDB):**
- ✅ Zero cost
- ✅ Zero setup
- ✅ Perfect for single user/author
- ❌ Limited to single instance
- ❌ No automatic backups
- ❌ Harder to scale

**After Migration (MongoDB):**
- ✅ Zero cost (free tier)
- ✅ Automatic backups
- ✅ Multiple instances can share
- ✅ Better for teams
- ✅ Easy to scale
- ❌ Slight latency increase (negligible)

**Migration is seamless. You can stay on NeDB indefinitely if single-user.**

---

## PHASE 2A: CREATE MONGODB ACCOUNT (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email
4. Create organization
5. Create free cluster (takes ~3 minutes)
6. Get connection string:
   ```
   mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/onne?retryWrites=true
   ```

---

## PHASE 2B: EXPORT NEDB DATA (10 minutes)

I'll provide this script when you need it. Save it as `export-nedb.js`:

```javascript
const Datastore = require('@seald-io/nedb');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.resolve(__dirname, './data/db');

const pitchesDb = new Datastore({ filename: path.join(DB_DIR, 'pitches.db'), autoload: true });
const filmDb = new Datastore({ filename: path.join(DB_DIR, 'film_agreement.db'), autoload: true });
const tasksDb = new Datastore({ filename: path.join(DB_DIR, 'tasks.db'), autoload: true });
const planDb = new Datastore({ filename: path.join(DB_DIR, 'plan90.db'), autoload: true });
const activityDb = new Datastore({ filename: path.join(DB_DIR, 'activities.db'), autoload: true });

async function exportAll() {
  const collections = {
    pitches: pitchesDb,
    film_agreement: filmDb,
    tasks: tasksDb,
    plan90: planDb,
    activities: activityDb
  };

  const exported = {};

  for (const [name, db] of Object.entries(collections)) {
    exported[name] = await new Promise((resolve, reject) => {
      db.find({}, (err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
  }

  fs.writeFileSync('nedb-export.json', JSON.stringify(exported, null, 2));
  console.log('✅ Exported to nedb-export.json');
  process.exit(0);
}

exportAll().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
```

Run: `node export-nedb.js`
This creates `nedb-export.json` with all your data.

---

## PHASE 2C: UPDATE CODE (20 minutes)

Replace `/novel-api/db.js` with MongoDB version:

```javascript
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/onne';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define schemas
const PitchSchema = new mongoose.Schema({ /* ... */ }, { strict: false });
const FilmSchema = new mongoose.Schema({ /* ... */ }, { strict: false });
const TaskSchema = new mongoose.Schema({ /* ... */ }, { strict: false });
const PlanSchema = new mongoose.Schema({ /* ... */ }, { strict: false });
const ActivitySchema = new mongoose.Schema({ /* ... */ }, { strict: false });

const PitchModel = mongoose.model('Pitch', PitchSchema);
const FilmModel = mongoose.model('Film', FilmSchema);
const TaskModel = mongoose.model('Task', TaskSchema);
const PlanModel = mongoose.model('Plan', PlanSchema);
const ActivityModel = mongoose.model('Activity', ActivitySchema);

module.exports = {
  pitchesDb: {
    find: (query, cb) => PitchModel.find(query, cb),
    insert: (doc, cb) => PitchModel.create(doc, cb),
    update: (query, update, opts, cb) => PitchModel.findOneAndUpdate(query, update, cb),
    remove: (query, opts, cb) => PitchModel.deleteOne(query, cb)
  },
  // ... same pattern for others
};
```

**Key benefit:** API code doesn't change. Just swap the database.

---

## PHASE 2D: UPLOAD EXPORTED DATA (5 minutes)

```bash
# 1. Install MongoDB CLI tools
npm install mongodb

# 2. Import data
mongoimport --uri "mongodb+srv://user:pass@cluster.mongodb.net/onne" \
  --collection pitches \
  --file nedb-export.json \
  --jsonArray
```

Or use MongoDB Atlas UI:
1. Collections → Import Data
2. Select `nedb-export.json`
3. Verify all collections imported

---

## PHASE 2E: UPDATE RENDER (5 minutes)

1. Go to Render dashboard
2. Select `onne-api` service
3. Environment → Add variable:
   - `MONGO_URI`: `mongodb+srv://user:pass@cluster.mongodb.net/onne`
4. Redeploy

---

## PHASE 2F: TEST & VERIFY (5 minutes)

```bash
# Test API
curl https://onne-api.onrender.com/api/plan90

# Should return same data as before
# If all good, delete local NeDB files
rm -rf /Users/tatacheriyo/Documents/onne/data
```

---

## ROLLBACK (If something breaks)

1. Revert code to NeDB version
2. Redeploy
3. Everything still works (NeDB files still there)

**Zero data loss. Always reversible.**

---

## MIGRATION COSTS

| Phase | Database | Cost | Users | Storage |
|-------|----------|------|-------|---------|
| 1 (Now) | NeDB | $0 | 1 | Unlimited |
| 2 (Later) | MongoDB Atlas | $0 | 1-10 | 512MB |
| 3 (Scale) | MongoDB Atlas | $57/mo | 10+ | 5GB |

---

## WHEN TO MIGRATE?

Migrate when:
- [ ] App is stable and users are happy
- [ ] You have >50MB data (unlikely for this use case)
- [ ] You need automatic backups
- [ ] You're adding team members
- [ ] You want geographic distribution

For solo author with local database: **Stay on NeDB indefinitely.**

---

## RECOMMENDED TIMELINE

- **Phase 1 (Week 1)**: Deploy with NeDB → Go live
- **Phase 2 (Month 2-3)**: If stable → Migrate to MongoDB
- **Phase 3 (Month 6+)**: If successful → Upgrade to paid tier

**One step at a time. No rush.**

---

## QUESTIONS?

When you're ready to migrate, I can:
- Write export/import scripts
- Update db.js for MongoDB
- Test the migration
- Monitor for issues
- Rollback if needed

**Just ask. We'll do it together.**
