# Knowledge Base Management System - Design Document

## Overview

The Knowledge Base Management System provides administrators with a comprehensive interface to manage FAQs, articles, and external website links that power the chatbot's knowledge base. The system integrates seamlessly with the existing admin dashboard, leveraging the current MongoDB data models (Faq and Article) and following established patterns for API routes, authentication, and UI components.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Dashboard UI                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  FAQ Manager │  │Article Manager│  │ Link Manager │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  /api/faq    │  │ /api/article │  │ /api/link    │      │
│  │  CRUD Routes │  │  CRUD Routes │  │  CRUD Routes │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (MongoDB)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Faq Model    │  │Article Model │  │ Link Model   │      │
│  │ (existing)   │  │ (existing)   │  │ (new)        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with authentication middleware
- **Database**: MongoDB with Mongoose ODM
- **UI Components**: Lucide React icons, custom components following existing patterns
- **Authentication**: JWT-based auth with role-based access control (admin only)

## Components and Interfaces

### 1. Frontend Components

#### KnowledgeBasePage Component
**Location**: `app/dashboard/admin/knowledge-base/page.tsx`

Main page component that orchestrates the knowledge base management interface.

**Props**: None (uses client-side hooks for auth and data)

**State Management**:
```typescript
interface KnowledgeBaseState {
  activeTab: 'faqs' | 'articles' | 'links';
  searchQuery: string;
  selectedCategory: string | null;
  isLoading: boolean;
  error: string | null;
}
```

**Key Features**:
- Tab-based navigation between FAQs, Articles, and Links
- Global search across all content types
- Category filtering
- Responsive layout with Sidebar and DashboardHeader

#### FAQManager Component
**Location**: `components/admin/FAQManager.tsx`

Manages FAQ CRUD operations with inline editing capabilities.

**Props**:
```typescript
interface FAQManagerProps {
  searchQuery: string;
  selectedCategory: string | null;
}
```

**State**:
```typescript
interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FAQManagerState {
  faqs: FAQ[];
  editingId: string | null;
  isCreating: boolean;
  formData: Partial<FAQ>;
  isSubmitting: boolean;
}
```

**Features**:
- List view with search and filter
- Inline edit mode
- Create new FAQ modal/form
- Delete with confirmation
- Validation feedback

#### ArticleManager Component
**Location**: `components/admin/ArticleManager.tsx`

Manages article CRUD operations with rich text editing.

**Props**:
```typescript
interface ArticleManagerProps {
  searchQuery: string;
  selectedCategory: string | null;
}
```

**State**:
```typescript
interface Article {
  _id?: string;
  title: string;
  content: string;
  author?: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface ArticleManagerState {
  articles: Article[];
  editingId: string | null;
  isCreating: boolean;
  formData: Partial<Article>;
  isSubmitting: boolean;
}
```

**Features**:
- Card-based list view with previews
- Full-screen editor for create/edit
- Tag management
- Content preview
- Delete with confirmation

#### LinkManager Component
**Location**: `components/admin/LinkManager.tsx`

Manages external website links.

**Props**:
```typescript
interface LinkManagerProps {
  searchQuery: string;
}
```

**State**:
```typescript
interface ExternalLink {
  _id?: string;
  title: string;
  url: string;
  description?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LinkManagerState {
  links: ExternalLink[];
  editingId: string | null;
  isCreating: boolean;
  formData: Partial<ExternalLink>;
  isSubmitting: boolean;
}
```

**Features**:
- List view with link previews
- URL validation
- Category organization
- Quick copy URL functionality
- Delete with confirmation

### 2. API Routes

All API routes follow the existing authentication pattern using `createAuthenticatedHandler` and `requireAdmin` middleware.

#### FAQ API Routes

**GET /api/faq**
- Fetch all FAQs with optional search and category filters
- Query params: `search`, `category`, `limit`, `page`
- Returns: `{ success: boolean, faqs: FAQ[], pagination: {...} }`

**POST /api/faq**
- Create new FAQ
- Body: `{ question: string, answer: string, category?: string }`
- Validation: question (10+ chars), answer (20+ chars)
- Returns: `{ success: boolean, faq: FAQ }`

**PUT /api/faq/[id]**
- Update existing FAQ
- Body: `{ question?: string, answer?: string, category?: string }`
- Returns: `{ success: boolean, faq: FAQ }`

**DELETE /api/faq/[id]**
- Delete FAQ by ID
- Returns: `{ success: boolean, message: string }`

#### Article API Routes

**GET /api/article**
- Fetch all articles with optional search and tag filters
- Query params: `search`, `tags`, `limit`, `page`
- Returns: `{ success: boolean, articles: Article[], pagination: {...} }`

**POST /api/article**
- Create new article
- Body: `{ title: string, content: string, author?: string, tags?: string[] }`
- Validation: title (5+ chars), content (50+ chars)
- Returns: `{ success: boolean, article: Article }`

**PUT /api/article/[id]**
- Update existing article
- Body: `{ title?: string, content?: string, author?: string, tags?: string[] }`
- Returns: `{ success: boolean, article: Article }`

**DELETE /api/article/[id]**
- Delete article by ID
- Returns: `{ success: boolean, message: string }`

#### Link API Routes

**GET /api/link**
- Fetch all external links with optional search and category filters
- Query params: `search`, `category`, `limit`, `page`
- Returns: `{ success: boolean, links: ExternalLink[], pagination: {...} }`

**POST /api/link**
- Create new external link
- Body: `{ title: string, url: string, description?: string, category?: string }`
- Validation: title (3+ chars), valid URL format
- Returns: `{ success: boolean, link: ExternalLink }`

**PUT /api/link/[id]**
- Update existing link
- Body: `{ title?: string, url?: string, description?: string, category?: string }`
- Returns: `{ success: boolean, link: ExternalLink }`

**DELETE /api/link/[id]**
- Delete link by ID
- Returns: `{ success: boolean, message: string }`

### 3. Data Models

#### Faq Model (Existing)
**Location**: `lib/models/Faq.ts`

Already implemented with:
- `question`: String (required, max 400 chars)
- `answer`: String (required, max 4000 chars)
- `category`: String (optional, max 120 chars)
- Timestamps: `createdAt`, `updatedAt`
- Indexes on `createdAt` and `category`

#### Article Model (Existing)
**Location**: `lib/models/Article.ts`

Already implemented with:
- `title`: String (required, max 240 chars)
- `content`: String (required, max 100,000 chars)
- `author`: String (optional, max 160 chars)
- `tags`: Array of strings
- Timestamps: `createdAt`, `updatedAt`
- Text index on `title`, `content`, and `tags`

#### ExternalLink Model (New)
**Location**: `lib/models/ExternalLink.ts`

To be created:
```typescript
export interface IExternalLink extends Document {
  title: string;
  url: string;
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

Schema definition:
- `title`: String (required, max 200 chars)
- `url`: String (required, valid URL)
- `description`: String (optional, max 500 chars)
- `category`: String (optional, max 120 chars)
- Timestamps: `createdAt`, `updatedAt`
- Indexes on `createdAt` and `category`

## Data Flow

### Create Flow (Example: FAQ)

```
User fills form → Validation → POST /api/faq → Auth check → 
Validate data → Save to MongoDB → Return new FAQ → 
Update UI state → Show success message
```

### Read Flow

```
Component mount → GET /api/faq?search=...&category=... → 
Auth check → Query MongoDB → Return FAQs → 
Update UI state → Render list
```

### Update Flow

```
User edits item → Validation → PUT /api/faq/[id] → 
Auth check → Validate data → Update MongoDB → 
Return updated FAQ → Update UI state → Show success message
```

### Delete Flow

```
User clicks delete → Confirmation dialog → DELETE /api/faq/[id] → 
Auth check → Delete from MongoDB → Return success → 
Remove from UI state → Show success message
```

## Error Handling

### Frontend Error Handling

1. **Validation Errors**: Display inline error messages below form fields
2. **API Errors**: Show toast notifications with error details
3. **Network Errors**: Display retry button with error message
4. **Loading States**: Show skeleton loaders during data fetching

### Backend Error Handling

1. **Authentication Errors**: Return 401 with clear message
2. **Validation Errors**: Return 400 with field-specific errors
3. **Not Found Errors**: Return 404 with resource details
4. **Database Errors**: Return 500 with generic message (log details server-side)

Error Response Format:
```typescript
{
  success: false,
  message: string,
  errors?: { field: string, message: string }[]
}
```

## Testing Strategy

### Unit Tests

1. **Component Tests**:
   - FAQ form validation
   - Article editor functionality
   - Link URL validation
   - Search and filter logic

2. **API Route Tests**:
   - CRUD operations for each resource
   - Authentication middleware
   - Input validation
   - Error handling

3. **Model Tests**:
   - Schema validation
   - Index creation
   - Data integrity

### Integration Tests

1. **End-to-End Flows**:
   - Create FAQ → View in list → Edit → Delete
   - Create article with tags → Search by tag → Update
   - Add external link → Validate URL → Update → Delete

2. **Authentication Flow**:
   - Admin access granted
   - Non-admin access denied
   - Unauthenticated access denied

### Manual Testing Checklist

- [ ] Create, read, update, delete operations for all content types
- [ ] Search functionality across all tabs
- [ ] Category filtering
- [ ] Form validation (client and server)
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] Responsive design on mobile/tablet
- [ ] Accessibility (keyboard navigation, screen readers)

## UI/UX Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Sidebar │ Dashboard Header                                   │
├─────────┼───────────────────────────────────────────────────┤
│         │ Knowledge Base Management                          │
│         │ ┌─────┬─────────┬───────┐                         │
│         │ │ FAQs│ Articles│ Links │ [Search...] [Filter ▼]  │
│         │ └─────┴─────────┴───────┘                         │
│         │                                                     │
│         │ [+ Add New]                                        │
│         │                                                     │
│         │ ┌─────────────────────────────────────────────┐   │
│         │ │ Item 1                              [Edit][X]│   │
│         │ │ Preview text...                             │   │
│         │ └─────────────────────────────────────────────┘   │
│         │ ┌─────────────────────────────────────────────┐   │
│         │ │ Item 2                              [Edit][X]│   │
│         │ │ Preview text...                             │   │
│         │ └─────────────────────────────────────────────┘   │
│         │                                                     │
│         │ [← Previous] [1] [2] [3] [Next →]                 │
└─────────┴───────────────────────────────────────────────────┘
```

### Color Scheme

Following existing dashboard patterns:
- Primary: Blue (#2563eb)
- Success: Green (#16a34a)
- Warning: Yellow (#eab308)
- Danger: Red (#dc2626)
- Background: Gray-50 (#f9fafb)
- Cards: White with gray-200 borders

### Interaction Patterns

1. **Inline Editing**: Click "Edit" button to enable inline editing mode
2. **Modal Forms**: Use modals for create operations to maintain context
3. **Confirmation Dialogs**: Show confirmation for destructive actions (delete)
4. **Toast Notifications**: Display success/error messages as toast notifications
5. **Loading States**: Show spinners during async operations

## Security Considerations

1. **Authentication**: All API routes require admin authentication
2. **Input Validation**: Server-side validation for all inputs
3. **XSS Prevention**: Sanitize user input, especially in article content
4. **SQL Injection**: Use Mongoose parameterized queries (built-in protection)
5. **Rate Limiting**: Consider adding rate limiting to prevent abuse
6. **CORS**: Maintain existing CORS configuration

## Performance Optimization

1. **Pagination**: Limit results to 20 items per page
2. **Debounced Search**: Debounce search input (300ms) to reduce API calls
3. **Lazy Loading**: Load content on-demand when switching tabs
4. **Caching**: Consider implementing client-side caching for frequently accessed data
5. **Database Indexes**: Leverage existing indexes on frequently queried fields

## Accessibility

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **ARIA Labels**: Proper ARIA labels for screen readers
3. **Focus Management**: Clear focus indicators and logical tab order
4. **Color Contrast**: Maintain WCAG AA compliance for text contrast
5. **Error Announcements**: Screen reader announcements for errors and success messages

## Future Enhancements

1. **Rich Text Editor**: Implement WYSIWYG editor for article content
2. **Bulk Operations**: Add bulk delete and category assignment
3. **Import/Export**: CSV/JSON import/export for FAQs and articles
4. **Version History**: Track changes to articles and FAQs
5. **Analytics**: Track which FAQs/articles are most accessed by chatbot
6. **AI Suggestions**: Suggest FAQ answers based on common queries
7. **Media Support**: Add image/video support for articles
8. **Multilingual Support**: Support for multiple languages
