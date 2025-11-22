# Design Document

## Overview

The sales executive visitors page is currently non-functional because it's calling a non-existent API endpoint. This design outlines the solution to fix the API endpoint reference and ensure proper data flow from the existing backend API to the frontend visitors page.

## Architecture

The current architecture has the following components:
- Frontend: Sales Executive Visitors Page (`/app/dashboard/sales-executive/visitors/page.tsx`)
- Backend: Customer Executive Enquiries Management API (`/api/analytics/customer-executive-enquiries-management`)
- Database: MongoDB with Visitor collection

The issue is a mismatch between the API endpoint the frontend is calling and the actual endpoint that exists.

## Components and Interfaces

### Frontend Component Changes
The `SalesExecutiveVisitorsPage` component needs to be updated to:
1. Call the correct API endpoint: `/api/analytics/customer-executive-enquiries-management`
2. Map the API response structure to the expected frontend data structure
3. Handle the response format that uses `enquiries` instead of `visitors`

### API Response Mapping
The existing API returns data in this structure:
```typescript
{
  success: boolean;
  enquiries: Array<{
    _id: string;
    visitorName: string;
    phoneNumber: string;
    email: string;
    enquiryType: 'chatbot' | 'email' | 'calls' | 'website';
    enquiryDetails: string;
    createdAt: string;
    status: string;
    assignedAgent: string;
    service: string;
    subservice: string;
    organization: string;
    region: string;
    salesExecutive: string;
    comments: string;
    amount: number;
    source: string;
    isConverted: boolean;
    lastInteractionAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: object;
}
```

The frontend expects data in this structure:
```typescript
{
  visitors: Array<{
    _id: string;
    name: string;
    email: string;
    phone?: string;
    organization?: string;
    region?: string;
    service: string;
    subservice?: string;
    enquiryDetails?: string;
    source: 'chatbot' | 'email' | 'calls' | 'website';
    createdAt: string;
    lastInteractionAt?: string;
    isConverted: boolean;
    status: string;
    agent?: string;
    agentName?: string;
    assignedAgent?: string;
    salesExecutive?: string;
    salesExecutiveName?: string;
    comments?: string;
    amount?: number;
  }>;
}
```

## Data Models

### Visitor Data Mapping
The following mapping will be applied to transform API response to frontend format:

| API Field | Frontend Field | Transformation |
|-----------|----------------|----------------|
| `enquiries` | `visitors` | Array rename |
| `visitorName` | `name` | Direct mapping |
| `phoneNumber` | `phone` | Direct mapping |
| `enquiryType` | `source` | Direct mapping |
| `assignedAgent` | `agentName` | Direct mapping |
| `salesExecutive` | `salesExecutiveName` | Direct mapping |

## Error Handling

### API Error Scenarios
1. **Network Errors**: Display user-friendly message about connectivity issues
2. **Authentication Errors**: Redirect to login page and clear stored tokens
3. **Server Errors**: Show generic error message with option to retry
4. **Empty Data**: Show "No visitors found" message with appropriate icon

### Error Recovery
- Implement retry mechanism for transient network errors
- Provide manual refresh option for users
- Log errors to console for debugging while showing user-friendly messages

## Testing Strategy

### Unit Tests
- Test API endpoint URL construction
- Test data transformation logic
- Test error handling scenarios
- Test filtering and statistics calculation

### Integration Tests
- Test full data flow from API to UI
- Test authentication flow
- Test role-based data filtering

### Manual Testing
- Verify visitors display correctly for sales executives
- Test filtering by source type
- Verify statistics calculations
- Test error scenarios (network issues, authentication failures)

## Implementation Notes

### Key Changes Required
1. Update API endpoint URL from `/api/analytics/visitors-management` to `/api/analytics/customer-executive-enquiries-management`
2. Update response handling to use `enquiries` array instead of `visitors`
3. Add proper data transformation to map API response to frontend expectations
4. Ensure authentication headers are properly sent
5. Update error handling to match the actual API response format

### Backward Compatibility
This change is purely a bug fix and doesn't affect any existing functionality. The API endpoint being called doesn't exist, so there's no risk of breaking existing integrations.

### Performance Considerations
- The existing API already implements pagination and filtering
- No additional performance optimizations needed
- The data transformation is lightweight and won't impact performance