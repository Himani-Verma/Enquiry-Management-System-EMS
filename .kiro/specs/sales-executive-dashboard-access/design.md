# Design Document

## Overview

This design addresses the missing visitors page for sales executives and improves the role-based data access to ensure sales executives can see their assigned enquiries and visitors. The solution includes creating a new visitors page, enhancing the data filtering logic, and providing fallback access to unassigned data.

## Architecture

### Component Structure
```
cms/app/dashboard/sales-executive/
├── enquiries/page.tsx (existing - enhanced)
├── visitors/page.tsx (new)
└── components/
    ├── VisitorTable.tsx (new)
    └── AssignmentManager.tsx (new)
```

### API Routes
```
cms/app/api/analytics/
├── sales-executive-enquiries/route.ts (existing - enhanced)
├── sales-executive-visitors/route.ts (new)
└── assign-visitors/route.ts (new)
```

## Components and Interfaces

### 1. Sales Executive Visitors Page
**File**: `cms/app/dashboard/sales-executive/visitors/page.tsx`

**Purpose**: Dedicated page for sales executives to view and manage their assigned visitors

**Key Features**:
- Display visitors assigned to the sales executive
- Show unassigned visitors when no specific assignments exist
- Provide visitor statistics and filtering
- Allow status updates and comment additions
- Export functionality for visitor data

### 2. Enhanced Data Filtering Logic
**File**: `cms/lib/middleware/auth.ts` (enhanced)

**Current Issue**: The `getUserContext` function correctly creates filters, but if no data matches the filter, users see empty results.

**Enhanced Logic**:
```typescript
// Enhanced filtering with fallback
if (isSalesExecutive) {
  // Primary filter: assigned visitors
  const assignedFilter = { 
    $or: [
      { salesExecutive: userId },
      { salesExecutiveName: user.name }
    ]
  };
  
  // Fallback filter: unassigned visitors (when no assigned visitors exist)
  const fallbackFilter = {
    $and: [
      { $or: [
        { salesExecutive: { $exists: false } },
        { salesExecutive: null },
        { salesExecutiveName: { $exists: false } },
        { salesExecutiveName: null }
      ]}
    ]
  };
  
  return { assignedFilter, fallbackFilter };
}
```

### 3. Visitor Management API
**File**: `cms/app/api/analytics/sales-executive-visitors/route.ts`

**Purpose**: Dedicated API endpoint for sales executive visitor management

**Features**:
- Role-based visitor filtering
- Fallback to unassigned visitors
- Pagination and search
- Visitor statistics
- Assignment tracking

### 4. Assignment Management
**File**: `cms/app/api/analytics/assign-visitors/route.ts`

**Purpose**: API for assigning visitors to sales executives

**Features**:
- Bulk assignment of visitors
- Individual visitor assignment
- Assignment history tracking
- Validation of user assignments

## Data Models

### Enhanced Visitor Model
The existing Visitor model already has the necessary fields:
- `salesExecutive`: ObjectId reference to User
- `salesExecutiveName`: String name for display
- `assignmentHistory`: Array of assignment records

### Assignment History Schema
```typescript
assignmentHistory: [
  {
    assignedBy: String,      // User ID who made the assignment
    assignedTo: String,      // User ID who was assigned
    assignedToName: String,  // Display name of assignee
    assignedAt: Date,        // When assignment was made
    reason: String,          // Reason for assignment
    type: String            // 'sales-executive', 'customer-executive', 'agent'
  }
]
```

## Error Handling

### 1. No Assigned Data Scenario
**Problem**: Sales executive sees "No visitors found" / "No enquiries found"

**Solution**:
- Check for assigned data first
- If no assigned data, show unassigned data with clear messaging
- Provide option to claim/assign unassigned visitors
- Display helpful empty state with action buttons

### 2. Authentication Issues
**Problem**: User context not properly passed to API

**Solution**:
- Validate user context in API routes
- Provide clear error messages for authentication failures
- Implement proper token validation
- Add logging for debugging user context issues

### 3. Data Consistency
**Problem**: Mismatched user IDs and names in assignments

**Solution**:
- Validate assignments against user database
- Provide data migration utility for existing records
- Implement assignment validation in API routes
- Add data integrity checks

## Testing Strategy

### 1. Unit Tests
- Test role-based filtering logic
- Test assignment validation
- Test API route responses
- Test component rendering with different data states

### 2. Integration Tests
- Test complete user flow from login to data access
- Test assignment workflow
- Test fallback data access
- Test cross-role data isolation

### 3. User Acceptance Testing
- Test with actual sales executive accounts
- Verify data visibility matches expectations
- Test assignment and claiming workflows
- Verify empty states and error handling

## Implementation Phases

### Phase 1: Create Visitors Page
1. Create sales executive visitors page component
2. Implement basic visitor display and filtering
3. Add visitor statistics and empty states

### Phase 2: Enhance API Routes
1. Create sales-executive-visitors API route
2. Enhance existing enquiries API with fallback logic
3. Add assignment management API

### Phase 3: Improve Data Access
1. Enhance getUserContext with fallback logic
2. Add assignment validation
3. Implement data migration for existing records

### Phase 4: Assignment Management
1. Add visitor assignment interface
2. Implement bulk assignment functionality
3. Add assignment history tracking

## Security Considerations

### 1. Data Isolation
- Ensure sales executives only see appropriate data
- Validate user permissions on all API calls
- Implement proper role-based access controls

### 2. Assignment Validation
- Validate that assignments reference valid users
- Prevent unauthorized assignment changes
- Log all assignment activities for audit

### 3. API Security
- Validate user tokens on all requests
- Implement rate limiting for assignment operations
- Sanitize all user inputs

## Performance Considerations

### 1. Database Queries
- Add indexes for salesExecutive and salesExecutiveName fields
- Optimize queries with proper filtering
- Implement pagination for large datasets

### 2. Caching
- Cache user context for session duration
- Cache assignment data for frequently accessed records
- Implement client-side caching for static data

### 3. Loading States
- Implement proper loading indicators
- Add skeleton screens for better UX
- Optimize API response times