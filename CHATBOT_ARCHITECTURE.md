# Chatbot Iframe Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     WordPress Website                            │
│  (nablscope.envirocarelabs.com)                                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Page Content (Blog, Products, etc.)                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Chatbot Button (Fixed Position)                          │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  💬 Chat with Eva                                     │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Chatbot Container (When Open)                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  <iframe src="your-cms.com/chatbot">                 │ │ │
│  │  │                                                        │ │ │
│  │  │    ┌────────────────────────────────────────────┐    │ │ │
│  │  │    │  Next.js Chatbot Application               │    │ │ │
│  │  │    │  (Runs independently in iframe)            │    │ │ │
│  │  │    │                                             │    │ │ │
│  │  │    │  • Chat Interface                           │    │ │ │
│  │  │    │  • Message History                          │    │ │ │
│  │  │    │  • Visitor Registration                     │    │ │ │
│  │  │    │  • API Communication                        │    │ │ │
│  │  │    └────────────────────────────────────────────┘    │ │ │
│  │  │                                                        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js Backend (CMS)                          │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API Routes                                                │ │
│  │  • POST /api/visitors                                      │ │
│  │  • GET  /api/chat/[visitorId]/messages/public             │ │
│  │  • POST /api/chat/[visitorId]/messages                    │ │
│  │  • POST /api/analytics/chatbot-enquiry                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  MongoDB Database                                          │ │
│  │  • Visitors Collection                                     │ │
│  │  • Messages Collection                                     │ │
│  │  • Enquiries Collection                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. WordPress Site (Parent Window)
**Location:** `nablscope.envirocarelabs.com`

**Components:**
- **Chatbot Button:** Fixed position button (bottom-right)
- **Chatbot Container:** Popup container with iframe
- **JavaScript:** Toggle open/close, click outside to close

**Code Location:** WordPress snippet (WPCode or theme)

---

### 2. Next.js Chatbot Page (Iframe Content)
**Location:** `your-cms.com/chatbot`

**Components:**
- **ChatbotWidget Component:** Full chatbot UI
- **Visitor Registration Form:** Name, email, phone
- **Chat Interface:** Messages, quick replies, input
- **API Integration:** Communicates with backend

**Code Location:** `cms/app/chatbot/page.tsx`

---

### 3. Next.js Backend (API)
**Location:** `your-cms.com/api/*`

**Endpoints:**
- **POST /api/visitors:** Create/update visitor
- **GET /api/chat/[visitorId]/messages/public:** Fetch messages
- **POST /api/chat/[visitorId]/messages:** Send message
- **POST /api/analytics/chatbot-enquiry:** Create enquiry

**Code Location:** `cms/app/api/*`

---

### 4. MongoDB Database
**Collections:**
- **visitors:** Visitor information
- **messages:** Chat messages
- **enquiries:** Lead enquiries

---

## Data Flow

### User Opens Chatbot

```
1. User clicks button on WordPress site
   │
   ├─→ JavaScript toggles container visibility
   │
   └─→ Iframe loads: your-cms.com/chatbot
       │
       ├─→ Check localStorage for existing visitor ID
       │
       ├─→ If found: Load chat history
       │   │
       │   └─→ GET /api/chat/[visitorId]/messages/public
       │       │
       │       └─→ Display previous messages
       │
       └─→ If not found: Show registration form
```

### User Registers

```
1. User fills registration form
   │
   ├─→ Validate input (name, email, phone)
   │
   └─→ POST /api/visitors
       │
       ├─→ Create visitor in MongoDB
       │
       ├─→ Return visitor ID
       │
       └─→ Store in localStorage
           │
           └─→ Show chat interface
```

### User Sends Message

```
1. User types message and hits send
   │
   ├─→ Display message in UI immediately
   │
   └─→ POST /api/chat/[visitorId]/messages
       │
       ├─→ Save to MongoDB
       │
       ├─→ Generate bot response
       │
       └─→ Display bot response
           │
           └─→ POST /api/chat/[visitorId]/messages (bot message)
```

### User Selects Service

```
1. User clicks quick reply (e.g., "Water Testing")
   │
   ├─→ Update localStorage with service selection
   │
   ├─→ Update visitor record in database
   │   │
   │   └─→ PUT /api/visitors (update service field)
   │
   └─→ Show next step in conversation
```

### User Provides Details

```
1. User elaborates on their needs
   │
   ├─→ Save message to database
   │
   └─→ POST /api/analytics/chatbot-enquiry
       │
       ├─→ Create enquiry record
       │
       └─→ Link to visitor ID
           │
           └─→ Available in admin dashboard
```

---

## Security Considerations

### Iframe Security

**Headers Set in `next.config.js`:**
```javascript
{
  'X-Frame-Options': 'ALLOWALL',
  'Content-Security-Policy': "frame-ancestors 'self' *"
}
```

**Why:** Allows the chatbot to be embedded in any domain

### Data Isolation

- **localStorage:** Scoped to iframe origin (your-cms.com)
- **Cookies:** Scoped to iframe origin
- **No parent access:** WordPress site cannot access iframe data
- **No iframe access:** Iframe cannot access WordPress site data

### API Security

- **Validation:** All inputs validated on server
- **Sanitization:** HTML/script tags removed
- **Rate Limiting:** Consider adding to prevent abuse
- **CORS:** Configured to allow cross-origin requests

---

## Performance Optimization

### Lazy Loading
- Iframe only loads when button is clicked
- Reduces initial page load time

### Caching
- Chat history cached in localStorage
- Reduces API calls on page reload

### Responsive Design
- Mobile-optimized layout
- Touch-friendly buttons
- Adaptive sizing

---

## Deployment Architecture

### Development
```
WordPress (localhost) → Next.js (localhost:3000)
```

### Staging
```
WordPress (staging.site.com) → Next.js (staging-cms.site.com)
```

### Production
```
WordPress (nablscope.envirocarelabs.com) → Next.js (cms.envirocarelabs.com)
```

---

## Monitoring Points

### Frontend (WordPress)
- Button click events
- Iframe load time
- JavaScript errors

### Iframe (Chatbot)
- Registration completion rate
- Message send success rate
- API response times
- localStorage availability

### Backend (API)
- Endpoint response times
- Error rates
- Database query performance
- Visitor creation success rate

### Database
- Connection pool usage
- Query execution time
- Storage usage
- Index performance

---

## Scaling Considerations

### Horizontal Scaling
- Next.js app can be deployed to multiple instances
- Load balancer distributes traffic
- MongoDB can be clustered

### Caching Layer
- Redis for session management
- CDN for static assets
- API response caching

### Database Optimization
- Indexes on frequently queried fields
- Message archiving for old conversations
- Visitor data cleanup policies

---

## Backup & Recovery

### Data Backup
- MongoDB automated backups
- Message history retention policy
- Visitor data export capability

### Disaster Recovery
- Iframe fallback to error message
- API endpoint health checks
- Graceful degradation

---

## Future Enhancements

### Potential Features
- [ ] Real-time messaging (WebSocket)
- [ ] File upload support
- [ ] Voice message support
- [ ] Multi-language support
- [ ] Chatbot analytics dashboard
- [ ] A/B testing for responses
- [ ] Integration with CRM systems
- [ ] Automated follow-up emails
- [ ] Chat transcript export
- [ ] Sentiment analysis

### Technical Improvements
- [ ] Service worker for offline support
- [ ] Progressive Web App (PWA)
- [ ] End-to-end encryption
- [ ] Message delivery receipts
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Push notifications

---

## Maintenance Tasks

### Regular
- Monitor error logs
- Check API response times
- Review chat transcripts
- Update bot responses

### Periodic
- Database cleanup
- Performance optimization
- Security updates
- Feature enhancements

### As Needed
- Scale infrastructure
- Update dependencies
- Fix bugs
- Add new features
