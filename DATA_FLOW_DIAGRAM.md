# Agent Performance Tracking - Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Agent Login                                                   │
│     └─> GET /api/auth/login                                      │
│         Returns: JWT Token                                        │
│                                                                   │
│  2. Get Current User Info                                         │
│     └─> GET /api/auth/me                                         │
│         Headers: Authorization: Bearer <token>                    │
│         Returns: { id, name, role, ... }                         │
│                                                                   │
│  3. Add Enquiry (with tracking)                                   │
│     └─> POST /api/analytics/add-enquiry                          │
│         Body: {                                                   │
│           visitorName, email, phone,                             │
│           addedBy: user.id,      ← NEW                           │
│           addedByName: user.name ← NEW                           │
│         }                                                         │
│                                                                   │
│  4. Assign Visitor to Agent                                       │
│     └─> POST /api/analytics/assign-agent                         │
│         Body: { visitorId, agentId, agentName }                  │
│                                                                   │
│  5. View Agent Performance                                        │
│     └─> GET /api/analytics/agent-performance                     │
│         Returns: Real data from database                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND APIs                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  /api/auth/me                                                     │
│  ├─ Verify JWT token                                             │
│  ├─ Query User collection                                        │
│  └─ Return user info                                             │
│                                                                   │
│  /api/analytics/add-enquiry                                       │
│  ├─ Create/Update Visitor record                                 │
│  ├─ Create Enquiry record with addedBy field                     │
│  └─ Return success                                               │
│                                                                   │
│  /api/analytics/assign-agent                                      │
│  ├─ Update Visitor.assignedAgent                                 │
│  ├─ Add to assignmentHistory                                     │
│  └─ Return updated visitor                                       │
│                                                                   │
│  /api/analytics/agent-performance                                 │
│  ├─ Query all agents from User collection                        │
│  ├─ For each agent:                                              │
│  │   ├─ Count visitors (assignedAgent/salesExecutive/etc)        │
│  │   ├─ Count enquiries (addedBy = agentId)                      │
│  │   └─ Count leads (isConverted = true)                         │
│  └─ Return real performance data                                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Users Collection                                                 │
│  ┌────────────────────────────────────────┐                     │
│  │ _id, name, email, role, region, ...    │                     │
│  └────────────────────────────────────────┘                     │
│                                                                   │
│  Visitors Collection                                              │
│  ┌────────────────────────────────────────┐                     │
│  │ _id, name, email, phone                │                     │
│  │ assignedAgent ──────────┐              │                     │
│  │ salesExecutive ─────────┼──> User._id  │                     │
│  │ customerExecutive ──────┘              │                     │
│  │ isConverted: true/false                │                     │
│  └────────────────────────────────────────┘                     │
│                                                                   │
│  Enquiries Collection                                             │
│  ┌────────────────────────────────────────┐                     │
│  │ _id, visitorId, service, status        │                     │
│  │ addedBy ────────────────> User._id     │ ← NEW               │
│  │ addedByName: "Agent Name"              │ ← NEW               │
│  │ assignedAgent ──────────> User._id     │                     │
│  └────────────────────────────────────────┘                     │
│                                                                   │
│  Indexes (for performance):                                       │
│  ├─ Visitor.assignedAgent                                        │
│  ├─ Visitor.salesExecutive                                       │
│  ├─ Enquiry.addedBy                                              │
│  └─ Enquiry.assignedAgent                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: Agent Adds an Enquiry

```
1. Agent "John Doe" (ID: 123abc) logs in
   └─> Receives JWT token

2. Frontend calls /api/auth/me
   └─> Gets: { id: "123abc", name: "John Doe", role: "sales-executive" }

3. Agent fills enquiry form and submits
   └─> Frontend calls /api/analytics/add-enquiry with:
       {
         visitorName: "Jane Smith",
         email: "jane@example.com",
         enquiryDetails: "Interested in water testing",
         addedBy: "123abc",        ← John's ID
         addedByName: "John Doe"   ← John's name
       }

4. Backend creates Enquiry record:
   {
     _id: "enquiry_001",
     visitorId: "visitor_001",
     addedBy: "123abc",           ← Tracked!
     addedByName: "John Doe",
     status: "new"
   }

5. Later, admin views Agents page
   └─> API counts: Enquiry.countDocuments({ addedBy: "123abc" })
   └─> Shows: John Doe has added 1 enquiry
```

### Example 2: Visitor Assigned to Agent

```
1. Admin assigns visitor to agent
   └─> POST /api/analytics/assign-agent
       {
         visitorId: "visitor_001",
         agentId: "123abc",
         agentName: "John Doe"
       }

2. Backend updates Visitor record:
   {
     _id: "visitor_001",
     name: "Jane Smith",
     assignedAgent: "123abc",     ← Tracked!
     agentName: "John Doe"
   }

3. Later, admin views Agents page
   └─> API counts: Visitor.countDocuments({ assignedAgent: "123abc" })
   └─> Shows: John Doe has handled 1 visitor
```

### Example 3: Lead Conversion

```
1. Agent converts visitor to lead
   └─> Updates visitor: { isConverted: true }

2. Admin views Agents page
   └─> API counts: Visitor.countDocuments({
         assignedAgent: "123abc",
         isConverted: true
       })
   └─> Shows: John Doe has converted 1 lead
```

## Performance Metrics Calculation

```
For each agent:

┌─────────────────────────────────────────────────────────────┐
│ Visitors Handled                                             │
├─────────────────────────────────────────────────────────────┤
│ COUNT visitors WHERE:                                        │
│   assignedAgent = agentId OR                                 │
│   salesExecutive = agentId OR                                │
│   customerExecutive = agentId                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Enquiries Added                                              │
├─────────────────────────────────────────────────────────────┤
│ COUNT enquiries WHERE:                                       │
│   addedBy = agentId                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Leads Converted                                              │
├─────────────────────────────────────────────────────────────┤
│ COUNT visitors WHERE:                                        │
│   (assignedAgent = agentId OR                                │
│    salesExecutive = agentId OR                               │
│    customerExecutive = agentId)                              │
│   AND isConverted = true                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Conversion Rate                                              │
├─────────────────────────────────────────────────────────────┤
│ (Leads Converted / Visitors Handled) × 100                   │
└─────────────────────────────────────────────────────────────┘
```

## Before vs After

### BEFORE (Fake Data)
```javascript
visitorsHandled: uniqueVisitors + Math.floor(Math.random() * 20)
enquiriesAdded: Math.floor(uniqueVisitors * 0.7) + Math.floor(Math.random() * 10)
leadsConverted: Math.floor(uniqueVisitors * 0.3) + Math.floor(Math.random() * 5)
```
❌ Random numbers  
❌ Not based on real data  
❌ No accountability  

### AFTER (Real Data)
```javascript
visitorsHandled: await Visitor.countDocuments({ assignedAgent: agentId })
enquiriesAdded: await Enquiry.countDocuments({ addedBy: agentId })
leadsConverted: await Visitor.countDocuments({ assignedAgent: agentId, isConverted: true })
```
✅ Real database queries  
✅ Accurate metrics  
✅ Full accountability  

## Key Points

1. **Agent Tracking**: Every enquiry now knows which agent added it
2. **Visitor Assignment**: Visitors are linked to agents via assignedAgent field
3. **Real Metrics**: All numbers come from actual database counts
4. **Performance**: Optimized with database indexes
5. **Backward Compatible**: Works with existing data (shows 0 for untracked items)

## Migration Path

```
Existing System (No Tracking)
         │
         ▼
Deploy Backend Updates
         │
         ▼
Run Migration Script (Optional)
         │
         ▼
Update Frontend to Pass addedBy
         │
         ▼
New System (Full Tracking)
```
