# Deployment Checklist - Agent Performance Tracking

## Pre-Deployment

### 1. Code Review
- [ ] Review all modified files
- [ ] Check TypeScript compilation errors
- [ ] Verify no syntax errors
- [ ] Review database model changes

### 2. Testing (Local)
- [ ] Test `/api/auth/me` endpoint
- [ ] Test `/api/analytics/add-enquiry` with `addedBy` fields
- [ ] Test `/api/analytics/agent-performance` returns real data
- [ ] Verify database indexes are created
- [ ] Run test script: `node scripts/test-agent-performance.js`

### 3. Database Backup
- [ ] Create full database backup before deployment
- [ ] Document backup location and timestamp
- [ ] Test backup restoration process

```bash
# MongoDB backup command
mongodump --uri="your-connection-string" --out=backup-$(date +%Y%m%d-%H%M%S)
```

## Deployment Steps

### Step 1: Deploy Backend Changes
- [ ] Deploy updated API files
  - `cms/app/api/analytics/agent-performance/route.ts`
  - `cms/app/api/analytics/add-enquiry/route.ts`
  - `cms/app/api/auth/me/route.ts`
- [ ] Deploy updated model
  - `cms/lib/models/Enquiry.ts`
- [ ] Verify deployment successful
- [ ] Check server logs for errors

### Step 2: Verify Database Indexes
- [ ] Connect to production database
- [ ] Verify indexes are created:
  ```javascript
  db.enquiries.getIndexes()
  // Should show indexes on: addedBy, assignedAgent, visitorId, status, createdAt
  
  db.visitors.getIndexes()
  // Should show indexes on: assignedAgent, salesExecutive, email, phone, status, createdAt
  ```
- [ ] If indexes missing, create them manually:
  ```javascript
  db.enquiries.createIndex({ addedBy: 1 })
  db.enquiries.createIndex({ assignedAgent: 1 })
  db.visitors.createIndex({ assignedAgent: 1 })
  db.visitors.createIndex({ salesExecutive: 1 })
  ```

### Step 3: Test Backend in Production
- [ ] Test `/api/auth/me` endpoint
  ```bash
  curl -H "Authorization: Bearer YOUR_TOKEN" https://your-domain.com/api/auth/me
  ```
- [ ] Test `/api/analytics/agent-performance` endpoint
  ```bash
  curl https://your-domain.com/api/analytics/agent-performance
  ```
- [ ] Verify response contains real data (not sample data)
- [ ] Check server logs for any errors

### Step 4: Run Migration (If Needed)
Only if you have existing enquiries that need agent tracking:

- [ ] Update MongoDB URI in migration script
- [ ] Run migration script:
  ```bash
  export MONGODB_URI="your-production-connection-string"
  node scripts/migrate-enquiry-tracking.js
  ```
- [ ] Verify migration results
- [ ] Check database for updated records

### Step 5: Update Frontend
- [ ] Update enquiry forms to call `/api/auth/me`
- [ ] Update enquiry submission to include `addedBy` and `addedByName`
- [ ] Test adding enquiries in production
- [ ] Verify enquiries are saved with agent tracking

### Step 6: Verify Agent Performance Page
- [ ] Login as admin
- [ ] Navigate to Agents & Users page
- [ ] Verify numbers are displayed (not all zeros)
- [ ] Check browser console for any errors
- [ ] Verify numbers match database counts

## Post-Deployment Verification

### 1. Smoke Tests
- [ ] Login as different agent roles
- [ ] Add test enquiries
- [ ] Assign test visitors
- [ ] View agent performance page
- [ ] Verify all numbers update correctly

### 2. Data Validation
- [ ] Run test script in production:
  ```bash
  export MONGODB_URI="your-production-connection-string"
  node scripts/test-agent-performance.js
  ```
- [ ] Compare API results with database counts
- [ ] Verify no data loss occurred
- [ ] Check for any missing agent tracking

### 3. Performance Check
- [ ] Monitor API response times
- [ ] Check database query performance
- [ ] Verify indexes are being used
- [ ] Monitor server resource usage

### 4. User Acceptance Testing
- [ ] Have agents test adding enquiries
- [ ] Have admins verify performance metrics
- [ ] Collect feedback on accuracy
- [ ] Address any issues found

## Rollback Plan

If issues occur, follow this rollback procedure:

### Option 1: Quick Rollback (Frontend Only)
If only frontend has issues:
- [ ] Revert frontend changes
- [ ] Backend will continue to work with old frontend
- [ ] No data loss

### Option 2: Full Rollback (Backend + Frontend)
If backend has critical issues:
- [ ] Restore database from backup
- [ ] Revert backend code to previous version
- [ ] Revert frontend code to previous version
- [ ] Verify system is working

### Option 3: Partial Rollback (Keep Data, Revert Code)
If you want to keep new data but revert code:
- [ ] Revert backend code (old API will ignore new fields)
- [ ] Revert frontend code
- [ ] New database fields will remain but won't be used
- [ ] Can re-deploy later without data loss

## Monitoring

### What to Monitor
- [ ] API response times for `/api/analytics/agent-performance`
- [ ] Database query performance
- [ ] Error rates in server logs
- [ ] User complaints about incorrect numbers
- [ ] Database size growth

### Key Metrics
- [ ] Agent performance API response time < 2 seconds
- [ ] No increase in error rates
- [ ] All agents show non-zero metrics (if they have activity)
- [ ] Numbers match manual database counts

## Troubleshooting

### Issue: All agents show 0 enquiries
**Cause:** Frontend not passing `addedBy` fields  
**Fix:** Update frontend to include `addedBy` and `addedByName`

### Issue: All agents show 0 visitors
**Cause:** Visitors not assigned to agents  
**Fix:** Ensure visitor assignment workflow is working

### Issue: API is slow
**Cause:** Missing database indexes  
**Fix:** Create indexes on `addedBy`, `assignedAgent` fields

### Issue: Numbers don't match expectations
**Cause:** Data inconsistency or migration issues  
**Fix:** Run test script to verify database state

## Success Criteria

Deployment is successful when:
- ✅ All API endpoints return 200 status
- ✅ Agent performance page shows real numbers
- ✅ New enquiries are tracked with agent info
- ✅ No increase in error rates
- ✅ Response times are acceptable
- ✅ Test script passes all checks
- ✅ Users confirm numbers are accurate

## Documentation

Ensure team has access to:
- [ ] `QUICK_START.md` - Quick reference guide
- [ ] `IMPLEMENTATION_SUMMARY.md` - What changed
- [ ] `AGENT_TRACKING_IMPLEMENTATION.md` - Technical details
- [ ] `DATA_FLOW_DIAGRAM.md` - System architecture
- [ ] `scripts/README.md` - How to use scripts

## Sign-off

- [ ] Backend developer verified deployment
- [ ] Frontend developer verified integration
- [ ] QA tested all functionality
- [ ] Product owner approved metrics
- [ ] DevOps confirmed monitoring is active

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Verified By:** _______________  
**Issues Found:** _______________  
**Status:** ⬜ Success | ⬜ Partial | ⬜ Rollback Required
