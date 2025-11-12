# Quick Start Guide - Real Agent Performance Tracking

## 🎯 What Changed?

The Agents & Users page now shows **REAL data from the database** instead of fake/random numbers.

## ✅ What's Already Done (Backend)

1. ✅ Database models updated
2. ✅ API endpoints updated to fetch real data
3. ✅ Agent tracking fields added to Enquiry model
4. ✅ Performance queries optimized with indexes

## 🔧 What You Need to Do (Frontend)

### Step 1: Update Enquiry Forms

When adding an enquiry, include the current user's info:

```typescript
// Get current user info first
const token = localStorage.getItem('ems_token');
const userResponse = await fetch('/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { user } = await userResponse.json();

// Then add enquiry with tracking
await fetch('/api/analytics/add-enquiry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    visitorName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    enquiryDetails: 'Interested in services',
    service: 'Water Testing',
    // ADD THESE TWO FIELDS:
    addedBy: user.id,        // ← Agent ID
    addedByName: user.name   // ← Agent name
  })
});
```

### Step 2: Test It

1. Login as an agent (sales-executive or customer-executive)
2. Add a few enquiries
3. Assign some visitors to agents
4. Go to Admin → Agents & Users page
5. Verify the numbers are correct

## 🧪 Testing Scripts

### Test Current Data
```bash
cd cms
export MONGODB_URI="your-mongodb-connection-string"
node scripts/test-agent-performance.js
```

### Migrate Existing Data (if needed)
```bash
node scripts/migrate-enquiry-tracking.js
```

## 📊 How It Works

### Visitors Handled
Counts visitors where the agent is assigned as:
- `assignedAgent`
- `salesExecutive`
- `customerExecutive`

### Enquiries Added
Counts enquiries where `addedBy` field matches the agent's ID

### Leads Converted
Counts visitors assigned to the agent where `isConverted = true`

## 🔍 Verify It's Working

Check the browser console when loading the Agents page. You should see:
```
📊 Agent John Doe: 15 visitors, 8 enquiries, 3 leads
```

If you see random numbers or zeros, the tracking isn't working yet.

## 📚 Full Documentation

- **Implementation Details:** `AGENT_TRACKING_IMPLEMENTATION.md`
- **Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Scripts Guide:** `scripts/README.md`

## 🆘 Troubleshooting

### All agents show 0 enquiries
**Fix:** Frontend needs to pass `addedBy` and `addedByName` when creating enquiries

### All agents show 0 visitors
**Fix:** Ensure visitors are being assigned to agents using `/api/analytics/assign-agent`

### Numbers seem wrong
**Fix:** Run the test script to verify database data:
```bash
node scripts/test-agent-performance.js
```

## 🚀 Quick Checklist

- [ ] Backend code deployed
- [ ] Frontend updated to pass `addedBy` fields
- [ ] Test script run successfully
- [ ] Migration script run (if you have existing data)
- [ ] Verified numbers on Agents page match database
- [ ] Tested adding new enquiries
- [ ] Tested assigning visitors

## 📞 Need Help?

1. Check console logs (both browser and server)
2. Run test script to verify database
3. Review full documentation files
4. Check that MongoDB indexes are created

---

**Status:** Backend ✅ Complete | Frontend ⏳ Needs Update
