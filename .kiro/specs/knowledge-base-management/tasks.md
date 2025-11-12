# Implementation Plan

- [x] 1. Create ExternalLink data model


  - Create `lib/models/ExternalLink.ts` with schema for title, url, description, and category fields
  - Add validation rules: title (required, max 200 chars), url (required, valid format), description (optional, max 500 chars)
  - Create indexes on createdAt and category fields for query optimization
  - Export IExternalLink interface and ExternalLink model
  - _Requirements: 9.1, 9.4_




- [ ] 2. Implement FAQ API routes
- [ ] 2.1 Create GET /api/faq route
  - Implement route handler in `app/api/faq/route.ts` with GET method
  - Add authentication using createAuthenticatedHandler and requireAdmin middleware
  - Implement search functionality using regex on question and answer fields
  - Add category filtering support via query parameters
  - Implement pagination with limit and page query parameters (default 20 per page)

  - Return FAQ list with pagination metadata
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [ ] 2.2 Create POST /api/faq route
  - Implement POST method in `app/api/faq/route.ts`
  - Add server-side validation: question min 10 chars, answer min 20 chars
  - Connect to MongoDB and save new FAQ using Faq model


  - Return created FAQ with success status within 2 seconds
  - Handle validation errors with 400 status and field-specific error messages
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.3 Create PUT /api/faq/[id] route
  - Implement route handler in `app/api/faq/[id]/route.ts` with PUT method
  - Add authentication and admin authorization
  - Validate input using same rules as POST route

  - Find FAQ by ID and update fields
  - Update lastModified timestamp automatically via Mongoose
  - Return updated FAQ with success status
  - Handle not found errors with 404 status
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


- [x] 2.4 Create DELETE /api/faq/[id] route


  - Implement DELETE method in `app/api/faq/[id]/route.ts`
  - Add authentication and admin authorization
  - Find and delete FAQ by ID from database
  - Return success message within 2 seconds
  - Handle deletion errors with appropriate error messages
  - _Requirements: 4.1, 4.3, 4.4_


- [ ] 3. Implement Article API routes
- [ ] 3.1 Create GET /api/article route
  - Implement route handler in `app/api/article/route.ts` with GET method
  - Add authentication using createAuthenticatedHandler and requireAdmin middleware
  - Implement search functionality using text index on title and content
  - Add tag filtering support via query parameters
  - Implement pagination with limit and page query parameters


  - Return article list with title, creation date, last modified date, and content preview
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 3.2 Create POST /api/article route
  - Implement POST method in `app/api/article/route.ts`
  - Add server-side validation: title min 5 chars, content min 50 chars
  - Support optional author and tags fields

  - Connect to MongoDB and save new article using Article model
  - Return created article with success status within 2 seconds
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 3.3 Create PUT /api/article/[id] route
  - Implement route handler in `app/api/article/[id]/route.ts` with PUT method

  - Add authentication and admin authorization


  - Validate input using same rules as POST route
  - Find article by ID and update fields
  - Preserve original creation date while updating lastModified timestamp
  - Return updated article with success status
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 3.4 Create DELETE /api/article/[id] route

  - Implement DELETE method in `app/api/article/[id]/route.ts`
  - Add authentication and admin authorization
  - Find and delete article by ID from database
  - Return success message within 2 seconds
  - Handle deletion errors with appropriate error messages
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 4. Implement ExternalLink API routes


- [ ] 4.1 Create GET /api/link route
  - Implement route handler in `app/api/link/route.ts` with GET method
  - Add authentication using createAuthenticatedHandler and requireAdmin middleware
  - Implement search functionality on title and description fields
  - Add category filtering support via query parameters
  - Implement pagination with limit and page query parameters

  - Return link list with all fields
  - _Requirements: 9.1, 9.2_

- [ ] 4.2 Create POST /api/link route
  - Implement POST method in `app/api/link/route.ts`
  - Add server-side validation: title min 3 chars, valid HTTP/HTTPS URL format

  - Support optional description and category fields


  - Validate URL format using URL constructor or regex
  - Connect to MongoDB and save new link using ExternalLink model
  - Return created link with success status
  - _Requirements: 9.3, 9.4, 9.5_

- [ ] 4.3 Create PUT /api/link/[id] route
  - Implement route handler in `app/api/link/[id]/route.ts` with PUT method
  - Add authentication and admin authorization
  - Validate input using same rules as POST route

  - Find link by ID and update fields
  - Return updated link with success status
  - _Requirements: 9.5_

- [ ] 4.4 Create DELETE /api/link/[id] route
  - Implement DELETE method in `app/api/link/[id]/route.ts`
  - Add authentication and admin authorization
  - Find and delete link by ID from database
  - Return success message
  - Handle deletion errors with appropriate error messages

  - _Requirements: 9.5_

- [ ] 5. Create FAQManager component
- [ ] 5.1 Implement FAQ list view with search and filter
  - Create `components/admin/FAQManager.tsx` component
  - Implement state management for FAQs list, loading, and error states
  - Add search input field that filters FAQs by question or answer text
  - Implement debounced search (300ms) to reduce API calls
  - Add category filter dropdown

  - Fetch FAQs from GET /api/faq on component mount and filter changes
  - Display FAQ list with question, answer preview, creation date, and last modified date
  - Implement pagination controls for more than 20 FAQs
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5.2 Implement FAQ create functionality
  - Add "Create New FAQ" button that opens create form
  - Create form with question and answer text fields, and optional category field

  - Implement client-side validation: question min 10 chars, answer min 20 chars


  - Display validation errors inline below form fields
  - Submit form data to POST /api/faq
  - Show loading state during submission
  - Display success toast notification on successful creation
  - Clear form and refresh FAQ list after successful creation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5.3 Implement FAQ edit functionality
  - Add edit button for each FAQ in the list

  - Open inline edit mode or modal with pre-filled form data
  - Apply same validation rules as create form
  - Submit updated data to PUT /api/faq/[id]
  - Show loading state during submission
  - Display success toast notification on successful update
  - Refresh FAQ in list after successful update
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5.4 Implement FAQ delete functionality
  - Add delete button for each FAQ in the list
  - Show confirmation dialog before deletion with FAQ question preview

  - Submit delete request to DELETE /api/faq/[id] on confirmation
  - Show loading state during deletion
  - Display success toast notification on successful deletion
  - Remove FAQ from list after successful deletion
  - Display error message if deletion fails
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Create ArticleManager component
- [x] 6.1 Implement article list view with search and filter

  - Create `components/admin/ArticleManager.tsx` component
  - Implement state management for articles list, loading, and error states
  - Add search input field that filters articles by title or content
  - Implement debounced search (300ms) to reduce API calls
  - Add tag filter with multi-select support
  - Fetch articles from GET /api/article on component mount and filter changes
  - Display article cards with title, content preview, creation date, last modified date, and tags
  - Implement pagination controls

  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_



- [ ] 6.2 Implement article create functionality
  - Add "Create New Article" button that opens full-screen editor
  - Create form with title, content textarea, optional author field, and tags input
  - Implement client-side validation: title min 5 chars, content min 50 chars
  - Add tag management UI (add/remove tags)
  - Display validation errors inline below form fields
  - Submit form data to POST /api/article
  - Show loading state during submission
  - Display success toast notification on successful creation

  - Close editor and refresh article list after successful creation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 6.3 Implement article edit functionality
  - Add edit button for each article card
  - Open full-screen editor with pre-filled form data
  - Apply same validation rules as create form
  - Submit updated data to PUT /api/article/[id]
  - Show loading state during submission
  - Display success toast notification on successful update

  - Close editor and refresh article in list after successful update
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 6.4 Implement article delete functionality
  - Add delete button for each article card
  - Show confirmation dialog before deletion with article title
  - Submit delete request to DELETE /api/article/[id] on confirmation
  - Show loading state during deletion
  - Display success toast notification on successful deletion

  - Remove article from list after successful deletion
  - Display error message if deletion fails
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 7. Create LinkManager component
- [ ] 7.1 Implement link list view with search and filter
  - Create `components/admin/LinkManager.tsx` component
  - Implement state management for links list, loading, and error states

  - Add search input field that filters links by title or description


  - Implement debounced search (300ms) to reduce API calls
  - Add category filter dropdown
  - Fetch links from GET /api/link on component mount and filter changes
  - Display link list with title, URL, description, and category
  - Add quick copy URL button for each link
  - Implement pagination controls
  - _Requirements: 9.1, 9.2_


- [ ] 7.2 Implement link create functionality
  - Add "Add New Link" button that opens create form
  - Create form with title, URL, optional description, and optional category fields
  - Implement client-side validation: title min 3 chars, valid HTTP/HTTPS URL format
  - Display validation errors inline below form fields
  - Submit form data to POST /api/link
  - Show loading state during submission
  - Display success toast notification on successful creation

  - Clear form and refresh link list after successful creation
  - _Requirements: 9.3, 9.4_

- [ ] 7.3 Implement link edit functionality
  - Add edit button for each link in the list

  - Open edit form with pre-filled data
  - Apply same validation rules as create form
  - Submit updated data to PUT /api/link/[id]
  - Show loading state during submission
  - Display success toast notification on successful update
  - Refresh link in list after successful update
  - _Requirements: 9.5_



- [ ] 7.4 Implement link delete functionality
  - Add delete button for each link in the list
  - Show confirmation dialog before deletion with link title
  - Submit delete request to DELETE /api/link/[id] on confirmation
  - Show loading state during deletion
  - Display success toast notification on successful deletion
  - Remove link from list after successful deletion
  - Display error message if deletion fails
  - _Requirements: 9.5_

- [ ] 8. Create main KnowledgeBasePage component
- [ ] 8.1 Implement page layout and navigation
  - Update `app/dashboard/admin/knowledge-base/page.tsx` with complete implementation
  - Add Sidebar and DashboardHeader components following existing admin dashboard pattern
  - Implement tab-based navigation with three tabs: FAQs, Articles, Links
  - Add global search bar that applies to active tab
  - Add category filter dropdown that applies to active tab
  - Implement state management for activeTab, searchQuery, and selectedCategory
  - Apply authentication guard using AuthGuard component
  - _Requirements: 1.1, 5.1, 9.1_

- [ ] 8.2 Integrate manager components
  - Render FAQManager component when FAQs tab is active
  - Render ArticleManager component when Articles tab is active
  - Render LinkManager component when Links tab is active
  - Pass searchQuery and selectedCategory props to each manager component
  - Implement loading states while components fetch data
  - Display error messages if data fetching fails
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 8.3 Implement category management
  - Add UI to view all available categories across FAQs, Articles, and Links
  - Implement category filter that updates when user selects a category
  - Clear category filter when switching tabs or clicking clear button
  - Display active category in filter dropdown
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 9. Add error handling and user feedback
  - Implement toast notification system for success and error messages
  - Add error boundaries to catch and display component errors gracefully
  - Display inline validation errors for all form fields
  - Show loading spinners during async operations (fetch, create, update, delete)
  - Add retry functionality for failed API requests
  - Display user-friendly error messages for network failures
  - _Requirements: 2.5, 3.4, 6.5, 7.4_

- [ ] 10. Implement responsive design and accessibility
  - Ensure all components are responsive on mobile, tablet, and desktop
  - Add proper ARIA labels for screen readers on all interactive elements
  - Implement keyboard navigation for all forms and buttons
  - Ensure color contrast meets WCAG AA standards
  - Add focus indicators for keyboard navigation
  - Test with screen reader to verify accessibility
  - _Requirements: All requirements (cross-cutting concern)_
