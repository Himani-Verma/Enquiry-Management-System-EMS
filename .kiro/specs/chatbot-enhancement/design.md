# Chatbot Enhancement Design Document

## Overview

This design document outlines the technical architecture and implementation approach for enhancing the Envirocare Labs chatbot system. The enhancements will transform the current rule-based chatbot into an intelligent, AI-powered conversational system that provides personalized, context-aware interactions while maintaining the existing iframe-based architecture.

### Design Goals

1. **Maintain Backward Compatibility**: Preserve existing chatbot functionality while adding new features
2. **Scalable Architecture**: Design for future growth in users, features, and integrations
3. **Performance First**: Ensure fast response times and smooth user experience
4. **Modular Design**: Enable independent development and deployment of features
5. **Data Privacy**: Protect visitor information and comply with data protection regulations

### Technology Stack

- **Frontend**: React (Next.js), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB (existing)
- **AI/ML**: OpenAI GPT-4 API for conversational AI
- **Real-time**: Server-Sent Events (SSE) for typing indicators
- **File Storage**: AWS S3 or Cloudinary for media uploads
- **Analytics**: Custom analytics service + Google Analytics
- **Internationalization**: next-i18next for multi-language support

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ChatbotWidget (Enhanced)                                  │ │
│  │  • Message Interface                                       │ │
│  │  • File Upload Component                                   │ │
│  │  • Voice Input Component                                   │ │
│  │  • Language Selector                                       │ │
│  │  • Offline Queue Manager                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  API Gateway (Next.js API Routes)                         │ │
│  │  • Authentication Middleware                               │ │
│  │  • Rate Limiting                                           │ │
│  │  • Request Validation                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Business Logic Layer                                      │ │
│  │  • Conversation Manager                                    │ │
│  │  • AI Response Generator                                   │ │
│  │  • Sentiment Analyzer                                      │ │
│  │  • Enquiry Qualifier                                       │ │
│  │  • Analytics Tracker                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Service Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   OpenAI     │  │  Translation │  │  File        │         │
│  │   Service    │  │  Service     │  │  Storage     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   CRM        │  │  Email       │  │  Analytics   │         │
│  │   Integration│  │  Service     │  │  Service     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  MongoDB Collections                                       │ │
│  │  • visitors                                                │ │
│  │  • messages                                                │ │
│  │  • enquiries                                               │ │
│  │  • conversations (new)                                     │ │
│  │  • chatbot_analytics (new)                                 │ │
│  │  • conversation_templates (new)                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```



## Components and Interfaces

### 1. Enhanced ChatbotWidget Component

**Location**: `components/ChatbotWidget.tsx`

**New Props**:
```typescript
interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  isIframe?: boolean;
  language?: string;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
  aiEnabled?: boolean;
}
```

**New State Management**:
```typescript
interface ChatbotState {
  // Existing
  visitorId: string | null;
  messages: Message[];
  isLoading: boolean;
  
  // New
  conversationContext: ConversationContext;
  sentiment: SentimentScore;
  isTyping: boolean;
  offlineQueue: Message[];
  uploadedFiles: UploadedFile[];
  selectedLanguage: string;
  isRecording: boolean;
}
```

**Key Features**:
- Manages conversation state and context
- Handles file uploads and voice input
- Implements offline queue
- Displays typing indicators
- Manages language selection

### 2. AI Response Generator Service

**Location**: `lib/services/aiResponseGenerator.ts`

**Interface**:
```typescript
interface AIResponseGenerator {
  generateResponse(
    message: string,
    context: ConversationContext,
    knowledgeBase: KnowledgeBaseEntry[]
  ): Promise<AIResponse>;
  
  streamResponse(
    message: string,
    context: ConversationContext
  ): AsyncGenerator<string>;
}

interface AIResponse {
  text: string;
  confidence: number;
  suggestedActions: QuickReply[];
  requiresHumanHandoff: boolean;
  metadata: {
    tokensUsed: number;
    responseTime: number;
    sources: string[];
  };
}
```

**Implementation Details**:
- Uses OpenAI GPT-4 API with function calling
- Implements RAG (Retrieval-Augmented Generation) using knowledge base
- Maintains conversation history for context
- Includes confidence scoring to determine when to escalate
- Supports streaming responses for better UX

### 3. Conversation Manager

**Location**: `lib/services/conversationManager.ts`

**Interface**:
```typescript
interface ConversationManager {
  startConversation(visitorId: string): Promise<Conversation>;
  addMessage(conversationId: string, message: Message): Promise<void>;
  getContext(conversationId: string): Promise<ConversationContext>;
  updateContext(conversationId: string, updates: Partial<ConversationContext>): Promise<void>;
  endConversation(conversationId: string, reason: string): Promise<void>;
}

interface ConversationContext {
  conversationId: string;
  visitorId: string;
  currentIntent: string;
  extractedEntities: Record<string, any>;
  selectedService?: string;
  selectedSubservice?: string;
  collectedInfo: Record<string, any>;
  conversationStage: ConversationStage;
  messageHistory: Message[];
  sentiment: SentimentScore;
  language: string;
}
```

**Responsibilities**:
- Tracks conversation state across messages
- Extracts and stores entities (names, dates, services, etc.)
- Manages conversation flow and stages
- Persists context to database
- Provides context to AI for better responses



### 4. Sentiment Analysis Service

**Location**: `lib/services/sentimentAnalyzer.ts`

**Interface**:
```typescript
interface SentimentAnalyzer {
  analyze(text: string): Promise<SentimentScore>;
  analyzeBatch(texts: string[]): Promise<SentimentScore[]>;
}

interface SentimentScore {
  overall: 'positive' | 'neutral' | 'negative';
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    confusion: number;
  };
  urgency: 'low' | 'medium' | 'high';
}
```

**Implementation**:
- Uses OpenAI API for sentiment analysis
- Analyzes emotional tone and urgency
- Provides scores for multiple emotions
- Caches results to reduce API calls
- Triggers adaptive response strategies

### 5. File Upload Handler

**Location**: `lib/services/fileUploadHandler.ts`

**Interface**:
```typescript
interface FileUploadHandler {
  uploadFile(file: File, visitorId: string): Promise<UploadedFile>;
  validateFile(file: File): ValidationResult;
  getFileUrl(fileId: string): Promise<string>;
  deleteFile(fileId: string): Promise<void>;
}

interface UploadedFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  visitorId: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

**Features**:
- Validates file type and size
- Generates thumbnails for images
- Stores files in cloud storage (S3/Cloudinary)
- Associates files with visitor and conversation
- Implements virus scanning for security

### 6. Voice Input Handler

**Location**: `components/VoiceInputHandler.tsx`

**Interface**:
```typescript
interface VoiceInputHandler {
  startRecording(): Promise<void>;
  stopRecording(): Promise<AudioBlob>;
  transcribe(audio: AudioBlob): Promise<TranscriptionResult>;
  cancelRecording(): void;
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
}
```

**Implementation**:
- Uses Web Speech API for browser-based recording
- Falls back to OpenAI Whisper API for transcription
- Displays real-time recording indicator
- Allows user to review and edit transcription
- Handles permissions and errors gracefully



### 7. Analytics Service

**Location**: `lib/services/analyticsService.ts`

**Interface**:
```typescript
interface AnalyticsService {
  trackEvent(event: AnalyticsEvent): Promise<void>;
  trackConversation(conversation: Conversation): Promise<void>;
  getMetrics(dateRange: DateRange): Promise<ChatbotMetrics>;
  getTopQuestions(limit: number): Promise<QuestionFrequency[]>;
  generateReport(reportType: ReportType): Promise<Report>;
}

interface ChatbotMetrics {
  totalSessions: number;
  averageDuration: number;
  enquiryConversionRate: number;
  averageMessagesPerSession: number;
  sentimentDistribution: Record<string, number>;
  topIntents: IntentFrequency[];
  handoffRate: number;
  responseTime: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
}

interface AnalyticsEvent {
  type: 'session_start' | 'message_sent' | 'enquiry_created' | 'handoff_requested' | 'file_uploaded';
  visitorId: string;
  conversationId: string;
  timestamp: Date;
  metadata: Record<string, any>;
}
```

**Features**:
- Tracks all chatbot interactions
- Calculates performance metrics
- Identifies common questions and intents
- Generates reports for admin dashboard
- Provides real-time monitoring capabilities

### 8. Multi-Language Service

**Location**: `lib/services/translationService.ts`

**Interface**:
```typescript
interface TranslationService {
  detectLanguage(text: string): Promise<string>;
  translate(text: string, targetLanguage: string): Promise<string>;
  translateBatch(texts: string[], targetLanguage: string): Promise<string[]>;
  getSupportedLanguages(): string[];
}
```

**Implementation**:
- Uses next-i18next for static translations
- Integrates with OpenAI for dynamic message translation
- Caches translations to reduce API calls
- Supports language detection from user input
- Maintains language preference in conversation context

### 9. Proactive Engagement Manager

**Location**: `lib/services/proactiveEngagement.ts`

**Interface**:
```typescript
interface ProactiveEngagementManager {
  trackPageView(visitorId: string, page: string): Promise<void>;
  checkEngagementTriggers(visitorId: string): Promise<EngagementAction | null>;
  sendProactiveMessage(visitorId: string, message: string): Promise<void>;
  scheduleFollowUp(visitorId: string, delay: number): Promise<void>;
}

interface EngagementAction {
  type: 'message' | 'offer' | 'reminder';
  content: string;
  trigger: string;
  priority: number;
}
```

**Features**:
- Tracks visitor behavior across pages
- Triggers contextual messages based on behavior
- Sends follow-up messages for abandoned conversations
- Personalizes messages based on visitor history
- Respects user preferences and opt-outs



### 10. CRM Integration Service

**Location**: `lib/services/crmIntegration.ts`

**Interface**:
```typescript
interface CRMIntegration {
  syncEnquiry(enquiry: Enquiry): Promise<CRMSyncResult>;
  updateContact(visitorId: string, updates: ContactUpdate): Promise<void>;
  getContactHistory(crmContactId: string): Promise<ContactHistory>;
  retryFailedSync(syncId: string): Promise<CRMSyncResult>;
}

interface CRMSyncResult {
  success: boolean;
  crmRecordId?: string;
  error?: string;
  retryCount: number;
  syncedAt: Date;
}
```

**Implementation**:
- Supports multiple CRM platforms (configurable)
- Implements retry logic with exponential backoff
- Logs all sync attempts for debugging
- Handles field mapping between systems
- Provides webhook support for bidirectional sync

## Data Models

### New MongoDB Collections

#### 1. Conversations Collection

```typescript
interface Conversation {
  _id: ObjectId;
  conversationId: string;
  visitorId: string;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'ended' | 'abandoned' | 'handed_off';
  context: ConversationContext;
  messageCount: number;
  duration?: number; // in seconds
  enquiryCreated: boolean;
  enquiryId?: string;
  sentiment: {
    overall: string;
    history: SentimentScore[];
  };
  metadata: {
    userAgent: string;
    referrer: string;
    language: string;
    deviceType: 'mobile' | 'tablet' | 'desktop';
  };
}
```

#### 2. Chatbot Analytics Collection

```typescript
interface ChatbotAnalytics {
  _id: ObjectId;
  date: Date;
  metrics: {
    totalSessions: number;
    newVisitors: number;
    returningVisitors: number;
    averageDuration: number;
    averageMessagesPerSession: number;
    enquiriesCreated: number;
    conversionRate: number;
    handoffRequests: number;
  };
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topIntents: IntentFrequency[];
  topQuestions: QuestionFrequency[];
  responseTimeMetrics: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
}
```

#### 3. Conversation Templates Collection

```typescript
interface ConversationTemplate {
  _id: ObjectId;
  name: string;
  description: string;
  trigger: {
    type: 'service' | 'intent' | 'keyword';
    value: string;
  };
  flow: ConversationStep[];
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface ConversationStep {
  id: string;
  type: 'message' | 'question' | 'action';
  content: string;
  quickReplies?: string[];
  nextStep?: string;
  conditions?: StepCondition[];
}
```

#### 4. Enhanced Messages Collection

```typescript
interface EnhancedMessage {
  _id: ObjectId;
  conversationId: string;
  visitorId: string;
  sender: 'user' | 'bot' | 'agent';
  message: string;
  timestamp: Date;
  
  // New fields
  messageType: 'text' | 'file' | 'voice' | 'system';
  sentiment?: SentimentScore;
  intent?: string;
  entities?: Record<string, any>;
  confidence?: number;
  attachments?: UploadedFile[];
  metadata: {
    responseTime?: number;
    aiGenerated: boolean;
    tokensUsed?: number;
    language: string;
  };
}
```



## Error Handling

### Error Categories and Strategies

#### 1. AI Service Errors

**Scenarios**:
- OpenAI API rate limits
- API timeouts
- Invalid responses
- Service unavailable

**Handling Strategy**:
```typescript
class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean
  ) {
    super(message);
  }
}

// Retry logic with exponential backoff
async function callAIWithRetry(
  request: AIRequest,
  maxRetries: number = 3
): Promise<AIResponse> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callAI(request);
    } catch (error) {
      if (!error.retryable || i === maxRetries - 1) {
        // Fall back to rule-based response
        return generateFallbackResponse(request);
      }
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

#### 2. File Upload Errors

**Scenarios**:
- File too large
- Invalid file type
- Storage service unavailable
- Virus detected

**Handling Strategy**:
- Validate on client before upload
- Show clear error messages
- Provide alternative contact methods
- Log errors for monitoring

#### 3. Network Errors

**Scenarios**:
- Connection lost during conversation
- Slow network causing timeouts
- Intermittent connectivity

**Handling Strategy**:
- Implement offline queue
- Show connection status indicator
- Auto-retry failed requests
- Preserve conversation state locally

#### 4. Database Errors

**Scenarios**:
- Connection pool exhausted
- Write conflicts
- Query timeouts

**Handling Strategy**:
- Implement connection pooling
- Use optimistic locking for updates
- Cache frequently accessed data
- Graceful degradation (continue conversation even if logging fails)

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    userMessage: string;
    retryable: boolean;
    details?: Record<string, any>;
  };
}

// Example error codes
const ERROR_CODES = {
  AI_SERVICE_UNAVAILABLE: 'ai_service_unavailable',
  FILE_TOO_LARGE: 'file_too_large',
  INVALID_FILE_TYPE: 'invalid_file_type',
  NETWORK_ERROR: 'network_error',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  VALIDATION_ERROR: 'validation_error',
};
```



## Testing Strategy

### 1. Unit Testing

**Scope**: Individual functions and components

**Tools**: Jest, React Testing Library

**Coverage Areas**:
- AI response generation logic
- Sentiment analysis algorithms
- File validation functions
- Message formatting utilities
- Context management functions

**Example Test**:
```typescript
describe('SentimentAnalyzer', () => {
  it('should detect negative sentiment in frustrated messages', async () => {
    const analyzer = new SentimentAnalyzer();
    const result = await analyzer.analyze("This is taking too long! I'm frustrated.");
    
    expect(result.overall).toBe('negative');
    expect(result.emotions.anger).toBeGreaterThan(0.5);
    expect(result.urgency).toBe('high');
  });
});
```

### 2. Integration Testing

**Scope**: API endpoints and service interactions

**Tools**: Jest, Supertest, MongoDB Memory Server

**Coverage Areas**:
- API route handlers
- Database operations
- External service integrations (mocked)
- File upload workflows
- Conversation flow logic

**Example Test**:
```typescript
describe('POST /api/chat/message', () => {
  it('should generate AI response and save to database', async () => {
    const response = await request(app)
      .post('/api/chat/message')
      .send({
        visitorId: 'test-visitor',
        message: 'What water testing services do you offer?'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBeDefined();
    expect(response.body.quickReplies).toHaveLength(3);
    
    // Verify message was saved
    const messages = await Message.find({ visitorId: 'test-visitor' });
    expect(messages).toHaveLength(2); // User message + bot response
  });
});
```

### 3. End-to-End Testing

**Scope**: Complete user workflows

**Tools**: Playwright or Cypress

**Coverage Areas**:
- Complete conversation flows
- File upload and display
- Voice input functionality
- Language switching
- Offline mode behavior
- Mobile responsiveness

**Example Test**:
```typescript
test('visitor can complete enquiry flow', async ({ page }) => {
  await page.goto('/chatbot');
  
  // Register as visitor
  await page.fill('[name="name"]', 'Test User');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="phone"]', '1234567890');
  await page.click('button[type="submit"]');
  
  // Select service
  await page.click('text=Water Testing');
  
  // Provide details
  await page.fill('[placeholder="Type your message"]', 'I need drinking water testing');
  await page.click('button[aria-label="Send message"]');
  
  // Verify enquiry created
  await expect(page.locator('text=Thank you')).toBeVisible();
});
```

### 4. Performance Testing

**Scope**: Response times and load handling

**Tools**: Artillery, Lighthouse

**Metrics**:
- API response time < 500ms (p95)
- AI response generation < 3s (p95)
- Page load time < 2s
- Time to interactive < 3s
- Concurrent users: 100+

### 5. Accessibility Testing

**Scope**: WCAG 2.1 AA compliance

**Tools**: axe-core, WAVE, manual testing with screen readers

**Coverage Areas**:
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management
- ARIA labels

### 6. Security Testing

**Scope**: Vulnerability assessment

**Coverage Areas**:
- Input validation and sanitization
- File upload security (virus scanning, type validation)
- API authentication and authorization
- XSS prevention
- CSRF protection
- Rate limiting effectiveness



## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goals**: Set up core infrastructure for AI integration

**Deliverables**:
- Conversation Manager service
- Enhanced data models (Conversations collection)
- AI Response Generator with OpenAI integration
- Basic context management
- Updated API endpoints

**Success Criteria**:
- AI can generate contextual responses
- Conversation context persists across messages
- Existing functionality remains intact

### Phase 2: Intelligence (Weeks 3-4)

**Goals**: Add intelligent features

**Deliverables**:
- Sentiment Analysis service
- Intent recognition
- Entity extraction
- Adaptive response strategies
- Knowledge base integration (RAG)

**Success Criteria**:
- Chatbot detects sentiment accurately (>80% accuracy)
- Responses adapt based on sentiment
- Knowledge base queries return relevant information

### Phase 3: Engagement (Weeks 5-6)

**Goals**: Enhance user engagement

**Deliverables**:
- Proactive engagement manager
- Typing indicators
- Enhanced quick replies
- Conversation templates
- Admin customization interface

**Success Criteria**:
- Proactive messages trigger correctly
- Engagement rate increases by 20%
- Admins can customize responses without code

### Phase 4: Rich Media (Weeks 7-8)

**Goals**: Add multimedia support

**Deliverables**:
- File upload handler
- Voice input component
- Image preview and thumbnails
- Cloud storage integration
- Media management in admin panel

**Success Criteria**:
- Users can upload files successfully
- Voice input transcribes accurately (>90%)
- Files display correctly in chat

### Phase 5: Globalization (Weeks 9-10)

**Goals**: Multi-language support

**Deliverables**:
- Translation service
- Language detection
- Multi-language UI
- Translated bot responses
- Language preference persistence

**Success Criteria**:
- Supports 5+ languages
- Translation accuracy >95%
- Language switching works seamlessly

### Phase 6: Analytics & Integration (Weeks 11-12)

**Goals**: Advanced analytics and CRM integration

**Deliverables**:
- Analytics service
- Metrics dashboard
- CRM integration
- Report generation
- Performance monitoring

**Success Criteria**:
- Analytics dashboard shows real-time metrics
- CRM sync success rate >95%
- Reports generate correctly

### Phase 7: Optimization (Weeks 13-14)

**Goals**: Performance and accessibility

**Deliverables**:
- Offline support
- Performance optimizations
- Accessibility improvements
- Mobile optimizations
- Caching strategies

**Success Criteria**:
- Passes WCAG 2.1 AA compliance
- Load time <2s on 3G
- Works offline with queue
- Lighthouse score >90



## Security Considerations

### 1. Data Privacy

**Measures**:
- Encrypt sensitive data at rest (MongoDB encryption)
- Use HTTPS for all communications
- Implement data retention policies
- Provide data export and deletion capabilities
- Comply with GDPR/CCPA requirements

**Implementation**:
```typescript
// Data encryption for sensitive fields
const encryptedData = encrypt(visitorData, process.env.ENCRYPTION_KEY);

// Data retention policy
async function cleanupOldData() {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 12);
  
  await Conversation.deleteMany({
    endedAt: { $lt: cutoffDate },
    enquiryCreated: false
  });
}
```

### 2. Input Validation

**Measures**:
- Sanitize all user inputs
- Validate file uploads (type, size, content)
- Implement rate limiting
- Prevent XSS and injection attacks

**Implementation**:
```typescript
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// Input validation schema
const messageSchema = z.object({
  message: z.string().min(1).max(1000),
  visitorId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

// Sanitize user input
function sanitizeMessage(message: string): string {
  return DOMPurify.sanitize(message, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}
```

### 3. API Security

**Measures**:
- Implement API key authentication for admin endpoints
- Use JWT tokens for visitor sessions
- Rate limiting per IP and per visitor
- CORS configuration
- Request size limits

**Implementation**:
```typescript
// Rate limiting middleware
import rateLimit from 'express-rate-limit';

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many messages, please slow down'
});

// Apply to chat endpoints
app.use('/api/chat', chatLimiter);
```

### 4. File Upload Security

**Measures**:
- Validate file types using magic numbers
- Scan files for viruses
- Limit file sizes
- Store files in isolated storage
- Generate unique filenames

**Implementation**:
```typescript
import fileType from 'file-type';
import ClamScan from 'clamscan';

async function validateAndScanFile(file: Buffer): Promise<ValidationResult> {
  // Check file type
  const type = await fileType.fromBuffer(file);
  if (!ALLOWED_TYPES.includes(type?.mime)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  // Virus scan
  const clamscan = await new ClamScan().init();
  const { isInfected } = await clamscan.scanBuffer(file);
  if (isInfected) {
    return { valid: false, error: 'File contains malware' };
  }
  
  return { valid: true };
}
```

### 5. AI Safety

**Measures**:
- Content filtering for inappropriate responses
- Prompt injection prevention
- Response validation
- Human review for flagged content

**Implementation**:
```typescript
// Content moderation
async function moderateResponse(response: string): Promise<ModerationResult> {
  const moderation = await openai.moderations.create({
    input: response
  });
  
  if (moderation.results[0].flagged) {
    return {
      safe: false,
      categories: moderation.results[0].categories,
      fallbackResponse: 'I apologize, but I need to rephrase that response.'
    };
  }
  
  return { safe: true };
}
```

## Performance Optimization

### 1. Caching Strategy

**Implementation**:
```typescript
// Redis cache for frequently accessed data
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache knowledge base entries
async function getKnowledgeBase(): Promise<KnowledgeBaseEntry[]> {
  const cached = await redis.get('knowledge_base');
  if (cached) {
    return JSON.parse(cached);
  }
  
  const entries = await KnowledgeBase.find({ active: true });
  await redis.setex('knowledge_base', 3600, JSON.stringify(entries));
  return entries;
}

// Cache conversation context
async function getConversationContext(conversationId: string): Promise<ConversationContext> {
  const cacheKey = `context:${conversationId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const context = await Conversation.findOne({ conversationId });
  await redis.setex(cacheKey, 1800, JSON.stringify(context));
  return context;
}
```

### 2. Database Optimization

**Indexes**:
```typescript
// MongoDB indexes for performance
ConversationSchema.index({ visitorId: 1, startedAt: -1 });
ConversationSchema.index({ status: 1, endedAt: 1 });
MessageSchema.index({ conversationId: 1, timestamp: -1 });
MessageSchema.index({ visitorId: 1, timestamp: -1 });
AnalyticsSchema.index({ date: -1 });
```

**Query Optimization**:
```typescript
// Use projection to limit returned fields
const messages = await Message.find(
  { conversationId },
  { message: 1, sender: 1, timestamp: 1 }
).limit(50).sort({ timestamp: -1 });

// Use aggregation for analytics
const metrics = await Conversation.aggregate([
  { $match: { startedAt: { $gte: startDate } } },
  { $group: {
    _id: null,
    avgDuration: { $avg: '$duration' },
    totalSessions: { $sum: 1 },
    enquiries: { $sum: { $cond: ['$enquiryCreated', 1, 0] } }
  }}
]);
```

### 3. Frontend Optimization

**Code Splitting**:
```typescript
// Lazy load heavy components
const VoiceInput = dynamic(() => import('./VoiceInput'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const FileUpload = dynamic(() => import('./FileUpload'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

**Message Virtualization**:
```typescript
// Use react-window for long message lists
import { VariableSizeList } from 'react-window';

<VariableSizeList
  height={600}
  itemCount={messages.length}
  itemSize={index => getMessageHeight(messages[index])}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <MessageBubble message={messages[index]} />
    </div>
  )}
</VariableSizeList>
```

## Monitoring and Observability

### 1. Logging

**Implementation**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log AI interactions
logger.info('AI response generated', {
  conversationId,
  responseTime: duration,
  tokensUsed,
  confidence
});
```

### 2. Metrics

**Key Metrics to Track**:
- Response time (p50, p95, p99)
- Error rate
- AI API usage and costs
- Conversation completion rate
- User satisfaction scores
- System resource usage

### 3. Alerts

**Alert Conditions**:
- Error rate > 5%
- Response time > 5s (p95)
- AI API failures
- Database connection issues
- High memory/CPU usage

## Deployment Strategy

### 1. Environment Configuration

```bash
# .env.production
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
REDIS_URL=redis://...
AWS_S3_BUCKET=envirocare-chatbot-files
AWS_REGION=us-east-1
CRM_API_KEY=...
ENCRYPTION_KEY=...
```

### 2. Deployment Steps

1. Run database migrations
2. Deploy backend services
3. Deploy frontend with feature flags
4. Enable features gradually
5. Monitor metrics and errors
6. Rollback if issues detected

### 3. Feature Flags

```typescript
// Feature flag configuration
const features = {
  aiResponses: process.env.ENABLE_AI === 'true',
  voiceInput: process.env.ENABLE_VOICE === 'true',
  fileUpload: process.env.ENABLE_FILES === 'true',
  multiLanguage: process.env.ENABLE_I18N === 'true',
};

// Use in components
{features.voiceInput && <VoiceInputButton />}
```

## Conclusion

This design provides a comprehensive architecture for enhancing the Envirocare Labs chatbot with AI-powered features, rich media support, and advanced analytics. The modular design allows for incremental implementation while maintaining backward compatibility with the existing system. The phased approach ensures that each feature is thoroughly tested before moving to the next, reducing risk and allowing for early feedback.

