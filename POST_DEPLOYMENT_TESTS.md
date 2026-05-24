# Post-Deployment Testing Guide

After you've deployed, use this checklist to verify everything works correctly.

---

## 🧪 PHASE 1: VERIFY BACKEND API (Render)

### Test 1: API is responding
```bash
# Open terminal and run:
curl https://onne-api.onrender.com/api/plan90

# Expected: JSON response starting with {"meta":{...}}
# If error: Check Render logs for issues
```

### Test 2: Check Render service status
1. Go to https://render.com
2. Login with GitHub
3. Select "onne-api" service
4. Check:
   - [ ] Status shows "Live"
   - [ ] No errors in Logs tab
   - [ ] Disk shows < 50MB (good for NeDB)

### Test 3: API endpoints respond
```bash
# Test all main endpoints:

# Get all plan data
curl https://onne-api.onrender.com/api/plan90

# Get all activities
curl https://onne-api.onrender.com/api/plan90/activity

# Get all pitches
curl https://onne-api.onrender.com/api/pitches

# Get all tasks
curl https://onne-api.onrender.com/api/tasks

# Get film agreement
curl https://onne-api.onrender.com/api/filmAgreement
```

### Test 4: Database persistence test
```bash
# POST a test activity
curl -X POST https://onne-api.onrender.com/api/plan90/activity \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-05-24","type":"writing","note":"Test entry","words_written":100}'

# GET it back
curl https://onne-api.onrender.com/api/plan90/activity

# Verify your test entry appears in the response
```

✅ **Backend verified**

---

## 🎨 PHASE 2: VERIFY FRONTEND APP (Vercel)

### Test 1: App loads without errors
1. Open https://onne.vercel.app in browser
2. Check browser console (F12 → Console tab)
   - [ ] No red errors
   - [ ] No CORS errors
   - [ ] No 404s

### Test 2: Navigation works
1. Click "Business" in sidebar → "90-Day Plan"
   - [ ] Dashboard tab loads
   - [ ] Displays plan data (chapters, milestones, etc.)
   - [ ] Day counter shows correct number

2. Click "Pitch Status"
   - [ ] Loads 10 publishers
   - [ ] Shows funding progress
   - [ ] Can see agents and fundraise contacts

3. Click "Sunday Cinemas"
   - [ ] Shows film agreement details
   - [ ] Shows production milestones
   - [ ] Days remaining countdown visible

4. Click "Copywriting Tasks"
   - [ ] Shows task list
   - [ ] Can see all 21 tasks
   - [ ] Progress bar updates correctly

### Test 3: API connectivity
```javascript
// Open browser console (F12) and run:
fetch('https://onne-api.onrender.com/api/plan90')
  .then(r => r.json())
  .then(d => console.log('✓ API connected:', d))
  .catch(e => console.error('✗ API error:', e))
```

Expected: Logs the plan data without errors

### Test 4: Data persistence test
1. Go to "90-Day Plan" → "Activity Log" tab
2. Click "Log Today" button
3. Enter:
   - Date: Today's date
   - Type: "writing"
   - Note: "Test entry from deployment"
   - Words: 100
4. Click "Submit"
5. Refresh the page (F5)
   - [ ] Your entry is still there
   - [ ] Data persisted to backend ✓

### Test 5: Mobile responsiveness
1. Open https://onne.vercel.app on phone or use browser dev tools
2. Check:
   - [ ] Content doesn't overflow
   - [ ] Sidebar collapses or hides
   - [ ] Buttons are clickable
   - [ ] Text is readable

### Test 6: Check Vercel deployment status
1. Go to https://vercel.com
2. Select "onne" project
3. Check:
   - [ ] Latest deployment shows "Production"
   - [ ] No build errors
   - [ ] Deploy time < 5 minutes

✅ **Frontend verified**

---

## 📄 PHASE 3: VERIFY LANDING PAGE (Vercel)

### Test 1: Page loads
1. Open https://site-onne.vercel.app
2. Check:
   - [ ] Hero section visible
   - [ ] Progress bar shows $2,847/$10,000
   - [ ] "Why Support" cards display
   - [ ] Tier options visible

### Test 2: Interactive elements
1. Click "Why Support" cards - they should be readable
2. Click FAQ items - they should expand/collapse
3. Scroll down - content should flow smoothly
4. No 404 errors in console

### Test 3: Mobile view
1. View on phone or browser dev tools
2. Check:
   - [ ] Single column layout
   - [ ] Text readable
   - [ ] Cards stack vertically
   - [ ] No horizontal scroll

✅ **Landing page verified**

---

## 🔄 PHASE 4: END-TO-END DATA FLOW

### Complete Flow Test
1. Open frontend: https://onne.vercel.app
2. Go to "90-Day Plan" → "Activity Log"
3. Add new activity:
   - Date: 2026-05-24
   - Type: "writing"
   - Note: "E2E test from deployment"
   - Words: 200
4. Click Submit
5. Verify snackbar shows "Log created" (or similar success)
6. Refresh page (F5)
7. Activity should still be visible
8. Open new incognito window: https://onne.vercel.app
9. Go to "90-Day Plan" → "Activity Log"
10. Your activity is visible (proves backend persistence)

✅ **End-to-end verified**

---

## 🗂️ PHASE 5: VERIFY EACH FEATURE

### 90-Day Plan
- [ ] Dashboard loads with all KPI cards
- [ ] Word count updates correctly
- [ ] Chapter status can be edited
- [ ] Milestones display with timeline
- [ ] Funding progress shows $0 raised (correct initial state)
- [ ] Activity log saves new entries
- [ ] Investor returns tab shows projections

### Pitch Status
- [ ] All 10 publishers visible
- [ ] All 5 agents visible
- [ ] Fundraise contacts listed
- [ ] Can edit status (click the row)
- [ ] Save button works
- [ ] Changes persist on refresh

### Sunday Cinemas Agreement
- [ ] Agreement details display
- [ ] 8 production milestones visible
- [ ] Can update milestone status
- [ ] Days remaining counter shows
- [ ] Visual timeline renders

### Copywriting Tasks
- [ ] All 21 tasks visible
- [ ] Status indicators show correctly
- [ ] Can click to change status
- [ ] Can edit task inline
- [ ] Progress bar updates
- [ ] Can add new task

✅ **All features verified**

---

## ⚠️ PHASE 6: TROUBLESHOOTING

### If API endpoint returns 404
```
Problem: Cannot connect to API
Solution:
1. Check Render service is running (dashboard)
2. Check API_URL env var in Vercel
3. Verify Render URL matches: https://onne-api.onrender.com
4. Try with curl first to isolate the issue
5. Check Render logs for errors
```

### If data doesn't save
```
Problem: POST request succeeds but data disappears on refresh
Solution:
1. Check Render disk is mounted (Disks tab shows 1GB)
2. Check `/app/onne-db/` directory exists
3. Check database files aren't corrupted
4. Restart Render service (Manual Deploy)
5. Check database permissions
```

### If page loads slow
```
Problem: Page takes 30+ seconds to load
Solution:
1. Normal on free tier (cold start)
2. Make another request - should be instant
3. If consistently slow: check Render logs for errors
4. If unacceptable: upgrade to paid tier ($5/month)
```

### If CORS errors appear
```
Problem: Browser blocks requests with CORS error
Solution:
1. Verify CORS is enabled in server.js (already done)
2. Check API_URL doesn't have trailing slash
3. Verify API_URL matches exactly: https://onne-api.onrender.com
4. Clear browser cache (Ctrl+Shift+Del)
5. Try in incognito window
```

### If build fails on Vercel
```
Problem: "Build failed" shown in Vercel dashboard
Solution:
1. Click Deployment → View Build Logs
2. Find the error message
3. Common causes:
   - Missing npm packages: npm install locally, push update
   - TypeScript errors: Fix in code, push update
   - Angular version mismatch: Update package.json
4. Redeploy from Vercel dashboard
```

---

## 📊 PERFORMANCE VERIFICATION

### Metrics to check:

1. **API Response Time**
   ```bash
   time curl https://onne-api.onrender.com/api/plan90
   # Should be: < 500ms after warm-up
   ```

2. **Frontend Load Time**
   - Open browser DevTools (F12)
   - Network tab
   - Should complete in < 3 seconds total
   - JS bundle < 2MB

3. **Database Query Speed**
   - Add activity and refresh immediately
   - Should appear within 1 second

4. **Uptime**
   - Render dashboard → Service → Uptime
   - Should show > 99.5%

---

## ✅ FINAL CHECKLIST

Before you declare "Live":

- [ ] Backend API responds to all endpoints
- [ ] Frontend app loads without console errors
- [ ] Can create new activity and data persists
- [ ] All tabs/features load correctly
- [ ] Mobile view is responsive
- [ ] Landing page displays properly
- [ ] No CORS or API connectivity issues
- [ ] Render logs show no errors
- [ ] Vercel deployment shows "Production"
- [ ] Tested from multiple browsers/devices

---

## 🎉 YOU'RE LIVE!

If all tests pass, your application is ready for stakeholders!

### Share these URLs:
- **For investors/stakeholders**: https://site-onne.vercel.app (landing page)
- **For team**: https://onne.vercel.app (full app)
- **For mobile apps** (if needed): https://onne-api.onrender.com (backend)

### Monitor going forward:
- Check Render logs weekly
- Check Vercel analytics
- Watch Render disk usage (should stay < 50MB)

**Celebrate! You've gone from local development to production. 🚀**
