# Requirements Document

## Introduction

The sales executive visitors page is currently showing "No visitors found" because it's calling a non-existent API endpoint. The page attempts to fetch data from `/api/analytics/visitors-management` but this route doesn't exist. The correct endpoint `/api/analytics/customer-executive-enquiries-management` exists and returns the proper data structure, but the frontend is not using it.

## Glossary

- **Sales Executive Dashboard**: The dashboard interface used by sales executives to view and manage their assigned visitors
- **Visitors API**: The backend API endpoint that provides visitor data to the frontend
- **Customer Executive Enquiries Management API**: The existing API route at `/api/analytics/customer-executive-enquiries-management` that handles visitor/enquiry data
- **Frontend Visitors Page**: The React component at `/app/dashboard/sales-executive/visitors/page.tsx`

## Requirements

### Requirement 1

**User Story:** As a sales executive, I want to see all visitors assigned to me in the visitors dashboard, so that I can track and manage my leads effectively.

#### Acceptance Criteria

1. WHEN a sales executive navigates to the visitors page, THE Frontend Visitors Page SHALL call the correct API endpoint to fetch visitor data
2. WHEN the API call is successful, THE Frontend Visitors Page SHALL display all visitors assigned to the sales executive
3. WHEN visitor data is received, THE Frontend Visitors Page SHALL show accurate visitor counts in the statistics cards
4. THE Frontend Visitors Page SHALL use the existing Customer Executive Enquiries Management API endpoint instead of the non-existent visitors-management endpoint
5. THE Frontend Visitors Page SHALL properly map the API response data to the expected visitor data structure

### Requirement 2

**User Story:** As a sales executive, I want the visitor statistics to show accurate counts, so that I can quickly understand my workload distribution across different channels.

#### Acceptance Criteria

1. WHEN visitor data is loaded, THE Frontend Visitors Page SHALL calculate and display correct counts for chatbot, email, calls, and website sources
2. WHEN filtering by source type, THE Frontend Visitors Page SHALL show only visitors from the selected source
3. THE Frontend Visitors Page SHALL display "0" for sources with no visitors rather than showing loading states indefinitely
4. WHEN no visitors are assigned, THE Frontend Visitors Page SHALL show an appropriate "No visitors found" message
5. THE Frontend Visitors Page SHALL handle API errors gracefully and display meaningful error messages