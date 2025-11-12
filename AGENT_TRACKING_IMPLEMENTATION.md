# Agent Performance Tracking Implementation

## Overview
This document describes the implementation of **real database tracking** for agent performance metrics (visitors handled and enquiries added) in the Agents & Users page.

## Problem
Previously, the agent performance data was **not fetched from the database**. Instead, it was:
- Using random numbers for visitors handled
- Calculating enquiries as 70% of visitors + random numbers
- Not tracking which agent actually handled which visitor or added which enquiry

## Solution
Implemented real database tracking by:

### 1. Updated Enquiry Model (`cms/lib/models/Enquiry.ts`)
Added fields to track which agent added each enquiry:
```typescript
addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }  // Agent who added this enquiry
addedByName: String  // Agent name for quick access
```

### 2. Updated Agent Performance API (`cms/app/api/analytics/agent-performance/route.ts`)
Changed from mock data to **real database queries**:

**Visitors Handled:**
```typescript
const visitorsHandled = await Visitor.countDocuments({
  $or: [
    { assignedAgent: agentId },
    { salesExecutive: agentId },
    { customerExecutive: agentId }
  ]
});
```

**Enquiries Added:**
```typescript
const enquiriesAdded = await Enquiry.countDocuments({
  addedBy: agentId
});
```

**Leads Converted:**
```typescript
const leadsConverted = await Visitor.countDocuments({
  $or: [
    { assignedAgent: agentId },
    { salesExecutive: agentId },
    { customerExecutive: agentId }
  ],
  isConverted: true
});
```

### 3. Updated Add Enquiry API (`cms/app/api/analytics/add-enquiry/route.ts`)
Now accepts and stores who added the enquiry:
```typescript
addedBy: addedBy,  // Agent ID
addedByName: addedByName  // Agent name
```

### 4. Created User Info API (`cms/app/api/auth/me/route.ts`)
New endpoint to get current logged-in user's information:
- **Endpoint:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Returns:** Current user's ID, name, role, etc.

## How to Use

### For Frontend Developers

#### 1. When Adding an Enquiry
You need to pass the current user's ID and name:

```typescript
// First, get current user info
const token = localStorage.getItem('ems_token');
const userResponse = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { user } = await userResponse.json();

// Then, when adding enquiry, include addedBy fields
const response = await fetch('/api/analytics/add-enquiry', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    visitorName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    enquiryDetails: 'Interested in services',
    service: 'Water Testing',
    // Add these fields to track who added the enquiry
    addedBy: user.id,
    addedByName: user.name
  })
});
```

#### 2. When Assigning Visitors to Agents
The existing `/api/analytics/assign-agent` endpoint already tracks assignments properly. Just ensure you're using valid agent IDs:

```typescript
await fetch('/api/analytics/assign-agent', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    visitorId: visitor._id,
    agentId: agent._id,  // Must be valid MongoDB ObjectId
    agentName: agent.name
  })
});
```

## Database Schema Changes

### Enquiry Collection
New fields added:
- `addedBy` (ObjectId) - References User collection
- `addedByName` (String) - Agent name for quick access
- Indexes added for performance on `addedBy` field

### Visitor Collection
Already has proper fields (no changes needed):
- `assignedAgent` (ObjectId)
- `salesExecutive` (ObjectId)
- `customerExecutive` (ObjectId)

## Data Flow

```
1. Agent logs in → Gets JWT token
2. Agent adds enquiry → Frontend sends addedBy + addedByName
3. Backend saves enquiry with agent tracking
4. Admin views Agents page → API queries real data from DB
5. Performance metrics show actual counts
```

## Testing

### Test Real Data
1. Login as an agent (sales-executive or customer-executive)
2. Add some enquiries through the system
3. Assign some visitors to agents
4. Go to Admin → Agents & Users page
5. Verify the numbers match actual database records

### Verify Database Queries
Check the console logs when loading the agents page:
```
📊 Agent John Doe: 15 visitors, 8 enquiries, 3 leads
```

## Migration Notes

### Existing Data
- Old enquiries without `addedBy` field will show as 0 for that agent
- To backfill data, you can run a migration script to assign existing enquiries to agents based on other criteria

### Backward Compatibility
- The system still works if `addedBy` is not provided (will be null)
- Frontend should be updated to always pass `addedBy` fields going forward

## Performance Considerations

- Added database indexes on `addedBy`, `assignedAgent` fields
- Queries use `countDocuments()` which is optimized for counting
- Consider adding caching if agent count grows very large (>1000 agents)

## Future Enhancements

1. **Track enquiry modifications** - Who updated each enquiry
2. **Time-based metrics** - Performance by date range
3. **Activity logs** - Detailed audit trail of all agent actions
4. **Real-time updates** - WebSocket notifications for new assignments
5. **Performance analytics** - Response times, conversion rates over time

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/me` | GET | Get current user info | Yes (Bearer token) |
| `/api/analytics/agent-performance` | GET | Get real agent metrics | No (temp) |
| `/api/analytics/add-enquiry` | POST | Add enquiry with tracking | No (temp) |
| `/api/analytics/assign-agent` | POST | Assign visitor to agent | No (temp) |

## Troubleshooting

### Issue: Enquiries count is 0 for all agents
**Solution:** Ensure frontend is passing `addedBy` and `addedByName` when creating enquiries

### Issue: Visitors count is 0 for all agents
**Solution:** Ensure visitors are being assigned to agents using the `/api/analytics/assign-agent` endpoint

### Issue: Numbers don't match expectations
**Solution:** Check database directly:
```javascript
// In MongoDB shell
db.enquiries.countDocuments({ addedBy: ObjectId("agent_id_here") })
db.visitors.countDocuments({ assignedAgent: ObjectId("agent_id_here") })
```

## Contact
For questions or issues with this implementation, check the console logs which provide detailed information about what data is being fetched and calculated.
