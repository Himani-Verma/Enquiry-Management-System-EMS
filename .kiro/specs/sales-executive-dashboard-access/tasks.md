# Implementation Plan

- [x] 1. Create sales executive visitors page


  - Create the visitors page component at `/dashboard/sales-executive/visitors/page.tsx`
  - Implement visitor table with filtering, search, and pagination
  - Add visitor statistics display (total, by source, by status)
  - Include empty state handling with actionable messages
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Create sales executive visitors API route
  - Create `/api/analytics/sales-executive-visitors/route.ts`
  - Implement role-based filtering with fallback to unassigned visitors
  - Add pagination, search, and sorting functionality
  - Include visitor statistics calculation
  - _Requirements: 1.1, 1.2, 3.5_

- [ ] 3. Enhance enquiries API with fallback logic
  - Update `/api/analytics/sales-executive-enquiries/route.ts` to include fallback logic
  - When no assigned enquiries exist, show unassigned enquiries with clear messaging
  - Add assignment status indicators to API response
  - _Requirements: 2.1, 2.2, 3.5_

- [ ] 4. Create visitor assignment management API
  - Create `/api/analytics/assign-visitors/route.ts`
  - Implement individual and bulk visitor assignment functionality
  - Add assignment history tracking and validation
  - Include user validation for assignments
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5. Add visitor assignment interface components
  - Create assignment modal component for individual visitor assignment
  - Add bulk assignment interface for multiple visitors
  - Implement assignment history display
  - Add claim/assign buttons to visitor and enquiry tables
  - _Requirements: 2.3, 3.1, 3.2_


- [-] 6. Enhance role-based filtering logic

  - Update `getUserContext` in `/lib/middleware/auth.ts` to include fallback logic
  - Add assignment validation functions


  - Implement data consistency checks
  - _Requirements: 3.4, 3.5_

- [ ] 7. Update sidebar navigation
  - Add visitors link to sales executive sidebar navigation
  - Ensure proper active state highlighting
  - Update navigation permissions and role checks
  - _Requirements: 1.3_

- [ ] 8. Add database indexes for performance
  - Add indexes for `salesExecutive` and `salesExecutiveName` fields
  - Optimize queries for role-based filtering
  - Add compound indexes for common query patterns
  - _Requirements: 1.1, 2.1_

- [ ] 9. Create data migration utility
  - Create utility to assign existing unassigned visitors to sales executives
  - Add validation for existing assignment data
  - Implement data consistency repair functions
  - _Requirements: 3.1, 3.4_

- [ ] 10. Add comprehensive error handling
  - Implement proper error boundaries for visitor components
  - Add detailed error logging for assignment operations
  - Create user-friendly error messages for common scenarios
  - _Requirements: 1.2, 2.2, 3.5_

- [ ] 11. Write unit tests for new components
  - Test visitor page component with different data states
  - Test assignment management functionality
  - Test role-based filtering logic
  - Test API route responses and error handling
  - _Requirements: 1.1, 2.1, 3.1_