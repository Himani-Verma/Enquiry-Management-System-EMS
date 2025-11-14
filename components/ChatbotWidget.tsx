'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';

const API_BASE = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

type Step =
 | 'ask_explore'
 | 'select_main_service'
 | 'select_water_type'
 | 'select_environmental_type'
 | 'select_food_category'
 | 'ask_elaborate'
 | 'end_confirm'
 | 'free_text';

const REPL_YES_NO = ['Yes', 'No'];

// Main services will be loaded from the database
const MAIN_SERVICES: string[] = [];

const WATER_TYPES = [
 'Drinking Water Testing',
 'FSSAI Compliance Water Testing',
 'Swimming Pool Water Testing',
 'Others'
];

const ENV_TYPES = [
 'ETP Water Testing',
 'STP Water Testing',
 'Ambient Air',
 'Stack Emission',
 'Workplace Monitoring',
 'IAQ [Indoor Air Quality]',
 'Noise Testing',
 'Illumination',
 'Others'
];

// Food category descriptions
const FOOD_CATEGORY_DESCRIPTIONS: Record<string, string> = {
 'Cereals, Pulses, and By-Products': 'Rice, wheat, maize, pulses (lentils, chickpeas), flours, breakfast cereals, noodles.\n\nTests: Nutritional analysis (protein, carbs), pesticide residues, mycotoxins (aflatoxins), heavy metals, microbial contamination (Salmonella, E. coli).',
 'Milk and Dairy Products': 'Milk, cheese, butter, ghee, yogurt, milk powders.\n\nTests: Fat, protein, lactose, adulterants (urea, melamine), microbial load (coliforms), antibiotic residues.',
 'Fruits and Vegetables': 'Fresh, processed, canned fruits/vegetables, juices, purees.\n\nTests: Pesticide residues, nutritional content (vitamins, sugars), microbial safety, preservatives (sulfites).',
 'Meat and Meat Products': 'Poultry, fish, processed meats (sausages), seafood.\n\nTests: Pathogens (Listeria, Salmonella), veterinary drug residues, proximate analysis (fat, protein), spoilage indicators.',
 'Spices and Condiments': 'Whole/ground spices (turmeric, chili), seasoning blends.\n\nTests: Adulterants (synthetic dyes, starch), volatile oil, pesticide residues, microbial contamination.',
 'Beverages': 'Tea, coffee, soft drinks, alcoholic beverages, fruit-based drinks.\n\nTests: Caffeine, sugar, artificial sweeteners, microbial safety, chemical contaminants.',
 'Confectionery and Bakery Products': 'Chocolates, candies, biscuits, cakes, breads.\n\nTests: Sugar, fat types, preservatives, microbial quality (yeast, molds).',
 'Oils and Fats': 'Edible oils (mustard, soybean), ghee, margarine.\n\nTests: Peroxide value, free fatty acids, adulterants (argemone oil), oxidative stability.',
 'Nutraceuticals and Functional Foods': 'Dietary supplements, fortified foods, health drinks.\n\nTests: Active ingredient quantification (vitamins, minerals), contaminants, label claim verification.',
 'Ready-to-Eat and Processed Foods': 'Frozen foods, canned foods, ready meals.\n\nTests: Nutritional profiling, shelf-life, microbial safety, additive levels.',
 'Raw Agricultural Commodities': 'Grains, oilseeds, cotton, crops.\n\nTests: Moisture, pesticide residues, GMO testing, grading parameters.',
 'Organic Products': 'Organic fruits, vegetables, grains, processed foods.\n\nTests: Pesticide-free certification, chemical residues, authenticity verification.',
 'Planting Materials': 'Seeds, saplings.\n\nTests: Germination rate, purity, pest/pathogen presence.',
 'Potable and Process Water': 'Water for production, cleaning, or as an ingredient.\n\nTests: Chemical purity (heavy metals, nitrates), microbial contamination (coliforms), pH.',
 'Packaging Materials': 'Plastic containers, films, paper, metal cans.\n\nTests: Chemical migration (BPA, phthalates), heavy metal leaching, material safety.',
 'Feed and Fodder': 'Cattle, poultry, fish feed.\n\nTests: Nutritional content (protein, fiber), contaminants (aflatoxins), microbial safety.',
 'Others': 'Other food testing requirements'
};

const FOOD_CATEGORIES = [
 'Cereals, Pulses, and By-Products',
 'Milk and Dairy Products',
 'Fruits and Vegetables',
 'Meat and Meat Products',
 'Spices and Condiments',
 'Beverages',
 'Confectionery and Bakery Products',
 'Oils and Fats',
 'Nutraceuticals and Functional Foods',
 'Ready-to-Eat and Processed Foods',
 'Raw Agricultural Commodities',
 'Organic Products',
 'Planting Materials',
 'Potable and Process Water',
 'Packaging Materials',
 'Feed and Fodder',
 'Others'
];

const PAGE_SIZE = 6;

// Country codes for phone number dropdown
const COUNTRY_CODES = [
 { code: '+91', country: 'India', flag: '🇮🇳' },
 { code: '+1', country: 'United States', flag: '🇺🇸' },
 { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
 { code: '+86', country: 'China', flag: '🇨🇳' },
 { code: '+81', country: 'Japan', flag: '🇯🇵' },
 { code: '+49', country: 'Germany', flag: '🇩🇪' },
 { code: '+33', country: 'France', flag: '🇫🇷' },
 { code: '+39', country: 'Italy', flag: '🇮🇹' },
 { code: '+34', country: 'Spain', flag: '🇪🇸' },
 { code: '+7', country: 'Russia', flag: '🇷🇺' },
 { code: '+55', country: 'Brazil', flag: '🇧🇷' },
 { code: '+61', country: 'Australia', flag: '🇦🇺' },
 { code: '+82', country: 'South Korea', flag: '🇰🇷' },
 { code: '+65', country: 'Singapore', flag: '🇸🇬' },
 { code: '+971', country: 'UAE', flag: '🇦🇪' },
 { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
 { code: '+974', country: 'Qatar', flag: '🇶🇦' },
 { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
 { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
 { code: '+968', country: 'Oman', flag: '🇴🇲' },
 { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
 { code: '+66', country: 'Thailand', flag: '🇹🇭' },
 { code: '+63', country: 'Philippines', flag: '🇵🇭' },
 { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
 { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
 { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
 { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
 { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
 { code: '+977', country: 'Nepal', flag: '🇳🇵' },
 { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
 { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
 { code: '+98', country: 'Iran', flag: '🇮🇷' },
 { code: '+90', country: 'Turkey', flag: '🇹🇷' },
 { code: '+20', country: 'Egypt', flag: '🇪🇬' },
 { code: '+27', country: 'South Africa', flag: '🇿🇦' },
 { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
 { code: '+254', country: 'Kenya', flag: '🇰🇪' },
 { code: '+233', country: 'Ghana', flag: '🇬🇭' },
 { code: '+212', country: 'Morocco', flag: '🇲🇦' },
 { code: '+213', country: 'Algeria', flag: '🇩🇿' },
 { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
 { code: '+218', country: 'Libya', flag: '🇱🇾' },
 { code: '+249', country: 'Sudan', flag: '🇸🇩' },
 { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
 { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
 { code: '+256', country: 'Uganda', flag: '🇺🇬' },
 { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
 { code: '+257', country: 'Burundi', flag: '🇧🇮' },
 { code: '+258', country: 'Mozambique', flag: '🇲🇿' },
 { code: '+260', country: 'Zambia', flag: '🇿🇲' },
 { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
 { code: '+267', country: 'Botswana', flag: '🇧🇼' },
 { code: '+268', country: 'Eswatini', flag: '🇸🇿' },
 { code: '+266', country: 'Lesotho', flag: '🇱🇸' },
 { code: '+264', country: 'Namibia', flag: '🇳🇦' },
 { code: '+265', country: 'Malawi', flag: '🇲🇼' },
 { code: '+261', country: 'Madagascar', flag: '🇲🇬' },
 { code: '+230', country: 'Mauritius', flag: '🇲🇺' },
 { code: '+248', country: 'Seychelles', flag: '🇸🇨' },
 { code: '+269', country: 'Comoros', flag: '🇰🇲' },
 { code: '+262', country: 'Réunion', flag: '🇷🇪' },
 { code: '+590', country: 'Guadeloupe', flag: '🇬🇵' },
 { code: '+596', country: 'Martinique', flag: '🇲🇶' },
 { code: '+594', country: 'French Guiana', flag: '🇬🇫' },
 { code: '+508', country: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
 { code: '+687', country: 'New Caledonia', flag: '🇳🇨' },
 { code: '+689', country: 'French Polynesia', flag: '🇵🇫' },
 { code: '+681', country: 'Saint Martin', flag: '🇲🇫' }
];

// Validation rules configuration
const validationRules = {
 name: {
 required: 'Please enter your name',
 minLength: {
 value: 2,
 message: 'Name must be at least 2 characters'
 },
 maxLength: {
 value: 50,
 message: 'Name must not exceed 50 characters'
 },
 pattern: {
 value: /^[a-zA-Z\s'-]+$/,
 message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
 }
 },
 email: {
 required: 'Please enter your email address',
 maxLength: {
 value: 100,
 message: 'Email must not exceed 100 characters'
 },
 pattern: {
 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
 message: 'Please enter a valid email (e.g., user@example.com)'
 }
 },
 phone: {
 required: 'Please enter your phone number',
 pattern: {
 value: /^[0-9]{10,15}$/,
 message: 'Please enter a valid phone number (10-15 digits)'
 }
 }
};

// Helper function to sanitize input
const sanitizeInput = (input: string): string => {
 return input
 .trim()
 .replace(/<[^>]*>/g, '') // Remove HTML tags
 .replace(/[<>]/g, ''); // Remove angle brackets
};

interface VisitorData {
 name: string;
 email: string;
 phone: string;
 countryCode: string;
}

interface BackendMessage {
 sender: 'user' | 'bot';
 message: string;
 timestamp: string;
}

interface Message {
 id: string;
 message: string;
 is_visitor: boolean;
 timestamp: string;
}

interface ChatbotWidgetProps {
 isOpen: boolean;
 onToggle: () => void;
 isIframe?: boolean;
}

// Error Message Component
interface ErrorMessageProps {
 message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
 <div className="flex items-start mt-2 text-red-600 animate-fadeIn" role="alert">
 <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
 </svg>
 <p className="text-xs font-medium">{message}</p>
 </div>
);

// Success Icon Component
const SuccessIcon: React.FC = () => (
 <svg 
 className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2 animate-slideIn" 
 fill="currentColor" 
 viewBox="0 0 20 20"
 aria-hidden="true"
 >
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
 </svg>
);

export default function ChatbotWidget({ isOpen, onToggle, isIframe = false }: ChatbotWidgetProps) {
 const [visitorId, setVisitorId] = useState<string | null>(null);
 const [isRegistered, setIsRegistered] = useState(false);
 const [messages, setMessages] = useState<Message[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [newMessage, setNewMessage] = useState('');
 const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'faq' | 'articles'>('home');
 const [showVisitorForm, setShowVisitorForm] = useState(false);
 const [showChat, setShowChat] = useState(false);
 const [showFAQ, setShowFAQ] = useState(false);
 const [showArticles, setShowArticles] = useState(false);
 const [conversationStep, setConversationStep] = useState<Step>('ask_explore');
 const [quickReplies, setQuickReplies] = useState<string[]>([]);
 const [isFetchingMessages, setIsFetchingMessages] = useState(false);
 const [quickReplyPage, setQuickReplyPage] = useState(0);
 const [faqSearchQuery, setFaqSearchQuery] = useState('');
 const [articlesSearchQuery, setArticlesSearchQuery] = useState('');
 const [isChatEnded, setIsChatEnded] = useState(false);
 const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
 const [showCountryDropdown, setShowCountryDropdown] = useState(false);
 const [availableServices, setAvailableServices] = useState<string[]>(MAIN_SERVICES);
 const messagesEndRef = useRef<HTMLDivElement>(null);

 const { register, handleSubmit, formState: { errors, touchedFields, dirtyFields }, reset, watch, trigger, getFieldState } = useForm<VisitorData>({
 mode: 'onBlur',
 reValidateMode: 'onChange'
 });

 // Helper function to get field state classes
 const getFieldStateClass = (fieldName: keyof VisitorData): string => {
 const hasError = errors[fieldName];
 const isTouched = touchedFields[fieldName];
 const fieldValue = watch(fieldName);
 
 if (hasError) {
 return 'border-red-500 focus:ring-red-500 focus:border-red-500';
 }
 if (isTouched && !hasError && fieldValue) {
 return 'border-green-500 focus:ring-green-500 focus:border-green-500';
 }
 return 'border-gray-200 focus:ring-[#2d4891] focus:border-transparent';
 };

 // Helper function to check if field is valid
 const isFieldValid = (fieldName: keyof VisitorData): boolean => {
 const isTouched = touchedFields[fieldName];
 const hasError = errors[fieldName];
 const fieldValue = watch(fieldName);
 return Boolean(isTouched && !hasError && fieldValue);
 };

 // Set fixed services matching chatbot UI
 useEffect(() => {
 // Use only the 4 standard services as shown in chatbot
 setAvailableServices(['Water Testing', 'Food Testing', 'Environmental Testing', 'Others']);
 }, []);

 // State for FAQs and Articles from API
 const [faqData, setFaqData] = useState<any[]>([]);
 const [articlesData, setArticlesData] = useState<any[]>([]);
 const [loadingFaqs, setLoadingFaqs] = useState(false);
 const [loadingArticles, setLoadingArticles] = useState(false);

 // Fetch FAQs from API
 useEffect(() => {
 const fetchFaqs = async () => {
 try {
 setLoadingFaqs(true);
 console.log('🔄 Fetching FAQs from:', `${API_BASE}/api/faq?limit=100`);
 
 const response = await fetch(`${API_BASE}/api/faq?limit=100`, {
 method: 'GET',
 headers: {
 'Content-Type': 'application/json',
 },
 cache: 'no-store'
 });
 
 console.log('📡 Response status:', response.status, response.statusText);
 
 if (!response.ok) {
 throw new Error(`HTTP error! status: ${response.status}`);
 }
 
 const data = await response.json();
 console.log('📝 FAQ API Response:', data);
 
 if (data.success && data.faqs) {
 // Transform API data to match component structure
 const transformedFaqs = data.faqs.map((faq: any) => ({
 id: faq._id,
 question: faq.question,
 answer: faq.answer,
 category: faq.category || 'General',
 tags: [faq.category || 'General']
 }));
 console.log('✅ Transformed FAQs:', transformedFaqs.length, 'items');
 setFaqData(transformedFaqs);
 } else {
 console.error('❌ FAQ API returned error:', data.message);
 setFaqData([]);
 }
 } catch (error: any) {
 console.error('❌ Error fetching FAQs:', error.message, error);
 setFaqData([]);
 } finally {
 setLoadingFaqs(false);
 }
 };

 fetchFaqs();
 // Refresh FAQs every 30 seconds to get real-time updates
 const interval = setInterval(fetchFaqs, 30000);
 return () => clearInterval(interval);
 }, []);

 // Fetch Articles from API
 useEffect(() => {
 const fetchArticles = async () => {
 try {
 setLoadingArticles(true);
 const response = await fetch(`${API_BASE}/api/article?limit=100`);
 const data = await response.json();
 if (data.success) {
 // Transform API data to match component structure
 const transformedArticles = data.articles.map((article: any) => ({
 id: article._id,
 title: article.title,
 excerpt: article.contentPreview || article.content.substring(0, 150) + '...',
 category: article.tags[0] || 'General',
 tags: article.tags,
 readTime: `${Math.ceil(article.content.length / 1000)} min read`,
 content: article.content
 }));
 setArticlesData(transformedArticles);
 }
 } catch (error) {
 console.error('Error fetching articles:', error);
 } finally {
 setLoadingArticles(false);
 }
 };

 fetchArticles();
 // Refresh articles every 30 seconds to get real-time updates
 const interval = setInterval(fetchArticles, 30000);
 return () => clearInterval(interval);
 }, []);

 // Filtered FAQ data based on search
 const filteredFaqs = faqData.filter((faq: any) => 
 faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
 faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
 faq.category.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
 (faq.tags && faq.tags.some((tag: string) => tag.toLowerCase().includes(faqSearchQuery.toLowerCase())))
 );

 // Filtered Articles data based on search
 const filteredArticles = articlesData.filter((article: any) => 
 article.title.toLowerCase().includes(articlesSearchQuery.toLowerCase()) ||
 article.excerpt.toLowerCase().includes(articlesSearchQuery.toLowerCase()) ||
 article.category.toLowerCase().includes(articlesSearchQuery.toLowerCase()) ||
 article.tags.some((tag: string) => tag.toLowerCase().includes(articlesSearchQuery.toLowerCase()))
 );

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages, quickReplies]);

 useEffect(() => {
 if (conversationStep === 'select_food_category') {
 const start = quickReplyPage * PAGE_SIZE;
 const paginated = FOOD_CATEGORIES.slice(start, start + PAGE_SIZE);
 let replies = [...paginated];
 if (quickReplyPage > 0) replies = ['Previous', ...replies];
 if (start + PAGE_SIZE < FOOD_CATEGORIES.length) replies = [...replies, 'Next'];
 replies.push('Back');
 setQuickReplies(replies);
 }
 }, [conversationStep, quickReplyPage]);

 useEffect(() => {
 const storedVisitorId = localStorage.getItem('envirocareVisitorId');
 if (storedVisitorId) {
 setVisitorId(storedVisitorId);
 setIsRegistered(true);
 setShowVisitorForm(false);
 setShowChat(true);
 setConversationStep('free_text');
 setIsFetchingMessages(true);
 fetchMessages(storedVisitorId)
 .then((fetchedMessages) => {
 setMessages(fetchedMessages);
 if (fetchedMessages.length === 0) {
 const greeting = `Welcome back to Envirocare Labs, ${localStorage.getItem('envirocareVisitorName') || 'friend'}! I'm Eva, your Virtual Assistant. How can I assist you today? 😊`;
 const newMessage: Message = {
 id: crypto.randomUUID(),
 message: greeting,
 is_visitor: false,
 timestamp: new Date().toISOString()
 };
 setMessages([newMessage]);
 appendMessage(storedVisitorId, 'bot', greeting).catch((err) => {
 console.error('Failed to append greeting:', err);
 alert('Failed to save welcome message. Please try again.');
 });
 }
 })
 .catch((error) => {
 console.error('Error fetching messages:', error);
 const fallbackMessage: Message = {
 id: crypto.randomUUID(),
 message: 'Welcome back! I couldn’t load your previous chat. How can I assist you today?',
 is_visitor: false,
 timestamp: new Date().toISOString()
 };
 setMessages([fallbackMessage]);
 appendMessage(storedVisitorId, 'bot', fallbackMessage.message).catch((err) => {
 console.error('Failed to append fallback message:', err);
 });
 })
 .finally(() => setIsFetchingMessages(false));
 }
 }, []);

 // Close country dropdown when clicking outside
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (showCountryDropdown) {
 const target = event.target as Element;
 if (!target.closest('.country-dropdown')) {
 setShowCountryDropdown(false);
 }
 }
 };

 document.addEventListener('mousedown', handleClickOutside);
 return () => {
 document.removeEventListener('mousedown', handleClickOutside);
 };
 }, [showCountryDropdown]);

 async function upsertVisitor(data: VisitorData): Promise<string> {
 setIsLoading(true);
 try {
 // Get service and subservice from localStorage
 const service = localStorage.getItem('envirocareCurrentService') || 'General Inquiry';
 const subservice = localStorage.getItem('envirocareCurrentSubservice') || '';
 
 console.log(`👤 Creating/updating visitor:`, { name: data.name, email: data.email, service, subservice });
 
 const res = await fetch(`${API_BASE}/api/visitors`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 name: data.name,
 email: data.email,
 phone: data.phone,
 service: service,
 subservice: subservice,
 source: 'chatbot',
 meta: { widget: 'site', consent: true }
 })
 });
 
 console.log(`📡 Visitor creation response status: ${res.status} ${res.statusText}`);
 
 const out = await res.json();
 console.log(`📦 Visitor creation response:`, out);
 
 if (!res.ok) {
 console.error(`❌ Failed to create visitor - HTTP ${res.status}:`, out);
 // Provide more specific error messages
 if (res.status === 400) {
 throw new Error(`Invalid data: ${out.message || 'Please check your information'}`);
 } else if (res.status === 500) {
 throw new Error(`Server error: ${out.message || 'Please try again later'}`);
 } else {
 throw new Error(`Error ${res.status}: ${out.message || 'Failed to save visitor'}`);
 }
 }
 
 // Check for correct response format: {success: true, visitor: {_id: ...}}
 if (!out.success || !out.visitor || !out.visitor._id) {
 console.error(`❌ Invalid visitor creation response:`, out);
 throw new Error(out.message || 'Failed to save visitor');
 }
 
 console.log(`✅ Visitor created/updated successfully with ID: ${out.visitor._id}`);
 return out.visitor._id as string;
 } catch (error) {
 console.error(`❌ Error creating/updating visitor:`, error);
 throw error;
 } finally {
 setIsLoading(false);
 }
 }

 async function appendMessage(visitorId: string, sender: 'user' | 'bot', message: string): Promise<void> {
 try {
 // Validate visitor ID format
 if (!visitorId || !isValidObjectId(visitorId)) {
 console.warn(`⚠️ Invalid visitor ID format: ${visitorId}`);
 return; // Don't make API call for invalid IDs
 }
 
 console.log(`💬 Appending ${sender} message for visitor: ${visitorId}`);
 
 const res = await fetch(`${API_BASE}/api/chat/${visitorId}/messages`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ sender, message })
 });
 
 console.log(`📡 Save message response status: ${res.status} ${res.statusText}`);
 
 if (!res.ok) {
 const errorData = await res.json().catch(() => ({}));
 console.error(`❌ Failed to save message - HTTP ${res.status}:`, errorData);
 
 if (res.status === 404) {
 console.warn(`⚠️ Visitor ${visitorId} not found - message will be lost`);
 return; // Don't throw, just log and continue
 }
 
 // For other errors, don't throw to prevent UI crashes
 console.warn(`⚠️ Message not saved due to server error, but continuing...`);
 return;
 }
 
 console.log(`✅ Message saved successfully`);
 } catch (error) {
 console.error(`❌ Error appending message for visitor ${visitorId}:`, error);
 // Don't throw error to prevent UI crashes, just log it
 }
 }


 async function createEnquiry(visitorData: { name: string; email: string; phone: string; organization?: string; region?: string; location?: string }, service: string, enquiryDetails: string): Promise<void> {
 try {
 const subservice = localStorage.getItem('envirocareCurrentSubservice') || '';
 const res = await fetch(`${API_BASE}/api/analytics/chatbot-enquiry`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 name: visitorData.name,
 email: visitorData.email,
 phone: visitorData.phone,
 organization: visitorData.organization || '',
 service,
 subservice,
 enquiryDetails,
 location: visitorData.location || ''
 })
 });
 if (!res.ok) {
 console.warn('⚠️ Failed to create enquiry - continuing without enquiry');
 return; // Don't throw error, just log and continue
 }
 console.log('✅ Enquiry created successfully');
 } catch (error) {
 console.warn('⚠️ Error creating enquiry - continuing without enquiry:', error);
 // Don't throw error to prevent chat interruption
 }
 }

 // Update current visitor's selected service/subservice immediately
 async function updateVisitorServiceSelection(service?: string, subservice?: string): Promise<void> {
 try {
 if (!visitorId) return;
 const payload: any = { visitorId };
 if (typeof service === 'string') payload.service = service;
 if (typeof subservice === 'string') payload.subservice = subservice;
 const res = await fetch(`${API_BASE}/api/visitors`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload)
 });
 if (!res.ok) {
 console.warn('⚠️ Failed to update visitor service/subservice');
 }
 } catch (err) {
 console.warn('⚠️ Error updating visitor service/subservice:', err);
 }
 }

 // Helper function to validate MongoDB ObjectId format
 function isValidObjectId(id: string): boolean {
 return /^[0-9a-fA-F]{24}$/.test(id);
 }

 async function fetchMessages(visitorId: string): Promise<Message[]> {
 setIsFetchingMessages(true);
 try {
 // Validate visitor ID format
 if (!visitorId || !isValidObjectId(visitorId)) {
 console.warn(`⚠️ Invalid visitor ID format: ${visitorId}`);
 return []; // Return empty array for invalid IDs
 }
 
 console.log(`🔍 Fetching messages for visitor: ${visitorId}`);
 
 const res = await fetch(`${API_BASE}/api/chat/${visitorId}/messages/public`, {
 method: 'GET',
 headers: { 'Content-Type': 'application/json' }
 });
 
 console.log(`📡 Response status: ${res.status} ${res.statusText}`);
 
 const out = await res.json();
 console.log(`📦 Response data:`, out);
 
 if (!res.ok) {
 console.error(`❌ HTTP Error ${res.status}:`, out);
 if (res.status === 404) {
 console.warn(`⚠️ Visitor ${visitorId} not found - this might be a new visitor`);
 return []; // Return empty array for new visitors
 }
 // For other errors, return empty array instead of throwing
 console.warn(`⚠️ Could not fetch messages due to server error, returning empty array`);
 return [];
 }
 
 if (!out.ok) {
 console.error(`❌ API Error:`, out);
 throw new Error(out.message || 'Failed to fetch messages');
 }
 
 const messages = out.messages.map((msg: BackendMessage) => ({
 id: crypto.randomUUID(),
 message: msg.message,
 is_visitor: msg.sender === 'user',
 timestamp: msg.timestamp
 }));
 
 console.log(`✅ Successfully fetched ${messages.length} messages`);
 return messages;
 } catch (error) {
 console.error(`❌ Error fetching messages for visitor ${visitorId}:`, error);
 // Don't throw error, just return empty array to prevent UI crashes
 return [];
 } finally {
 setIsFetchingMessages(false);
 }
 }

 const resetChat = () => {
 localStorage.removeItem('envirocareVisitorId');
 localStorage.removeItem('envirocareVisitorName');
 localStorage.removeItem('envirocareCurrentService');
 localStorage.removeItem('envirocareCurrentSubservice');
 localStorage.removeItem('envirocareWaitingForElaboration');
 setVisitorId(null);
 setIsRegistered(false);
 setMessages([]);
 setShowVisitorForm(true);
 setShowChat(false);
 setConversationStep('ask_explore');
 setQuickReplies([]);
 setQuickReplyPage(0);
 setIsChatEnded(false);
 };

 // Handle form submission with validation
 const handleFormSubmit = async (data: VisitorData) => {
 // Trigger validation for all fields
 const isValid = await trigger(['name', 'email', 'phone']);
 
 if (!isValid) {
 // Focus on first invalid field
 const firstError = Object.keys(errors)[0] as keyof VisitorData;
 if (firstError) {
 const element = document.getElementById(firstError);
 element?.focus();
 }
 return;
 }
 
 // Proceed with submission
 await onSubmitVisitorData(data);
 };

 const onSubmitVisitorData = async (data: VisitorData) => {
 setIsLoading(true);
 try {
 console.log(`🚀 Starting chat for visitor:`, data.name);
 
 // Sanitize input data
 const sanitizedData = {
 name: sanitizeInput(data.name),
 email: sanitizeInput(data.email),
 phone: sanitizeInput(data.phone),
 countryCode: selectedCountryCode
 };
 
 // Combine country code with phone number
 const visitorDataWithCountryCode = {
 ...sanitizedData,
 phone: sanitizedData.phone ? `${selectedCountryCode}${sanitizedData.phone}` : '',
 countryCode: selectedCountryCode
 };
 
 const id = await upsertVisitor(visitorDataWithCountryCode);
 console.log(`✅ Visitor created with ID: ${id}`);
 
 setVisitorId(id);
 localStorage.setItem('envirocareVisitorId', id);
 localStorage.setItem('envirocareVisitorName', data.name);
 localStorage.setItem('envirocareVisitorEmail', data.email);
 localStorage.setItem('envirocareVisitorPhone', data.phone || '');
 setIsRegistered(true);
 reset();
 setShowVisitorForm(false);
 setShowChat(true);

 const greeting = `Hello ${data.name}! 👋 Welcome to *Envirocare Labs*! I'm Eva, your Virtual Assistant. Would you like to explore our services or have a specific question?`;
 const botMsg = greeting;

 setMessages([
 { id: crypto.randomUUID(), message: botMsg, is_visitor: false, timestamp: new Date().toISOString() }
 ]);
 
 // Try to save the greeting message, but don't fail if it doesn't work
 try {
 await appendMessage(id, 'bot', botMsg);
 } catch (error) {
 console.warn(`⚠️ Could not save greeting message:`, error);
 // Continue anyway - the message is already displayed in the UI
 }

 // Automatically create an enquiry for every new visitor (non-blocking)
 createEnquiry(data, 'Others', `New visitor ${data.name} started a conversation`)
 .then(() => console.log(`✅ Enquiry created for visitor: ${data.name}`))
 .catch((error) => console.warn(`⚠️ Could not create enquiry for visitor:`, error));

 setConversationStep('ask_explore');
 setQuickReplies([...REPL_YES_NO, 'Ask a question']);
 setIsChatEnded(false);
 
 console.log(`🎉 Chat started successfully for ${data.name}`);
 } catch (err) {
 console.error('❌ Error saving visitor:', err);
 alert('Failed to start chat. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 const handleQuickReply = async (choice: string) => {
 if (!visitorId || isLoading) return;

 const pushUser = async (text: string) => {
 const m = { id: crypto.randomUUID(), message: text, is_visitor: true, timestamp: new Date().toISOString() };
 setMessages(prev => [...prev, m]);
 try { 
 await appendMessage(visitorId, 'user', text); 
 } catch (error) {
 console.warn(`⚠️ Could not save user message:`, error);
 // Message is already displayed in UI, so continue
 }
 };

 const pushBot = async (text: string) => {
 const m = { id: crypto.randomUUID(), message: text, is_visitor: false, timestamp: new Date().toISOString() };
 setMessages(prev => [...prev, m]);
 try { 
 await appendMessage(visitorId, 'bot', text); 
 } catch (error) {
 console.warn(`⚠️ Could not save bot message:`, error);
 // Message is already displayed in UI, so continue
 }
 };

 setQuickReplies([]);
 if (choice === 'Previous' || choice === 'Next') {
 const delta = choice === 'Next' ? 1 : -1;
 setQuickReplyPage(prev => Math.max(0, prev + delta));
 return;
 }

 if (choice === 'Back') {
 let botMsg = '';
 let nextStep: Step = 'ask_explore';
 let nextReplies: string[] = [...REPL_YES_NO, 'Ask a question'];

 if (conversationStep === 'select_main_service') {
 botMsg = `Would you like to explore our services or have a specific question?`;
 } else if (['select_water_type', 'select_environmental_type', 'select_food_category'].includes(conversationStep)) {
 botMsg = 'Envirocare Labs offers a wide range of services! Which one are you interested in?';
 nextStep = 'select_main_service';
 nextReplies = [...availableServices, 'Back'];
 // Clear subservice selection when going back to main service
 localStorage.removeItem('envirocareCurrentSubservice');
 updateVisitorServiceSelection(localStorage.getItem('envirocareCurrentService') || undefined, '');
 } else if (conversationStep === 'ask_elaborate') {
 botMsg = 'Envirocare Labs offers a wide range of services! Which one are you interested in?';
 nextStep = 'select_main_service';
 nextReplies = [...availableServices, 'Back'];
 } else {
 return;
 }

 await pushUser('Back');
 await pushBot(botMsg);
 setConversationStep(nextStep);
 setQuickReplyPage(0);
 setQuickReplies(nextReplies);
 return;
 }

 setIsLoading(true);
 await pushUser(choice);

 try {
 switch (conversationStep) {
 case 'ask_explore': {
 if (choice.toLowerCase() === 'yes') {
 await pushBot('Envirocare Labs offers a wide range of services! Which one are you interested in?');
 setConversationStep('select_main_service');
 setQuickReplies([...availableServices, 'Back']);
 } else if (choice === 'Ask a question') {
 await pushBot('Go ahead and ask me anything! 😊');
 setConversationStep('free_text');
 } else {
 await pushBot('No problem! Is there something specific I can help you with?');
 setConversationStep('free_text');
 }
 break;
 }

 case 'select_main_service': {
 if (choice === 'Water Testing') {
 localStorage.setItem('envirocareCurrentService', choice);
 // Clear any previously selected subservice to avoid stale data
 localStorage.removeItem('envirocareCurrentSubservice');
 // Update visitor immediately
 updateVisitorServiceSelection(choice, '');
 await pushBot('Awesome! 💧 Water Testing is one of our specialties. What type of water testing are you interested in?');
 setConversationStep('select_water_type');
 setQuickReplies([...WATER_TYPES, 'Back']);
 } else if (choice === 'Environmental Testing') {
 localStorage.setItem('envirocareCurrentService', choice);
 // Clear any previously selected subservice to avoid stale data
 localStorage.removeItem('envirocareCurrentSubservice');
 // Update visitor immediately
 updateVisitorServiceSelection(choice, '');
 await pushBot('Great choice! 🌱 Environmental Testing is key to sustainability. What specific environmental service do you need?');
 setConversationStep('select_environmental_type');
 setQuickReplies([...ENV_TYPES, 'Back']);
 } else if (choice === 'Food Testing') {
 localStorage.setItem('envirocareCurrentService', choice);
 // Clear any previously selected subservice to avoid stale data
 localStorage.removeItem('envirocareCurrentSubservice');
 // Update visitor immediately
 updateVisitorServiceSelection(choice, '');
 await pushBot('Perfect! 🥫 Food Testing ensures safety and quality. Please select a food category:');
 setConversationStep('select_food_category');
 setQuickReplyPage(0);
 } else if (choice === 'Shelf-Life Study') {
 localStorage.setItem('envirocareCurrentService', choice);
 // Clear any previously selected subservice to avoid stale data
 localStorage.removeItem('envirocareCurrentSubservice');
 // Update visitor immediately
 updateVisitorServiceSelection(choice, '');
 await pushBot('Interesting! Shelf-Life Studies help optimize product longevity. Would you like to provide more details about your needs?');
 setConversationStep('ask_elaborate');
 setQuickReplies([...REPL_YES_NO, 'Back']);
 } else {
 await pushBot('Could you specify what kind of service you’re looking for? I’m here to help! 🤔');
 setConversationStep('free_text');
 }
 break;
 }

 case 'select_water_type': {
 localStorage.setItem('envirocareCurrentSubservice', choice);
 // Update visitor immediately with selected subservice
 updateVisitorServiceSelection(localStorage.getItem('envirocareCurrentService') || undefined, choice);
 await pushBot(`Got it! You selected ${choice}. Would you like to share more details about your water testing needs?`);
 setConversationStep('ask_elaborate');
 setQuickReplies([...REPL_YES_NO, 'Back']);
 break;
 }

 case 'select_environmental_type': {
 localStorage.setItem('envirocareCurrentSubservice', choice);
 // Update visitor immediately with selected subservice
 updateVisitorServiceSelection(localStorage.getItem('envirocareCurrentService') || undefined, choice);
 await pushBot(`Nice! You chose ${choice}. Want to dive deeper into your environmental testing requirements?`);
 setConversationStep('ask_elaborate');
 setQuickReplies([...REPL_YES_NO, 'Back']);
 break;
 }

 case 'select_food_category': {
 localStorage.setItem('envirocareCurrentSubservice', choice);
 // Update visitor immediately with selected subservice
 updateVisitorServiceSelection(localStorage.getItem('envirocareCurrentService') || undefined, choice);
 // Show description for the selected category
 const description = FOOD_CATEGORY_DESCRIPTIONS[choice] || `${choice} - Would you like to elaborate on your food testing needs?`;
 await pushBot(`You selected **${choice}**\n\n${description}\n\nWould you like to share more details about your food testing needs?`);
 setConversationStep('ask_elaborate');
 setQuickReplies([...REPL_YES_NO, 'Back']);
 break;
 }

 case 'ask_elaborate': {
 if (choice.toLowerCase() === 'yes') {
 await pushBot('Great! Please share more details, and I\'ll assist you further. 😊');
 // Set flag to indicate we're waiting for elaboration
 localStorage.setItem('envirocareWaitingForElaboration', 'true');
 setConversationStep('free_text');
 } else {
 // Create enquiry when visitor shows interest but doesn't want to elaborate
 try {
 const visitorData = {
 name: localStorage.getItem('envirocareVisitorName') || '',
 email: localStorage.getItem('envirocareVisitorEmail') || '',
 phone: localStorage.getItem('envirocareVisitorPhone') || '',
 organization: localStorage.getItem('envirocareVisitorOrg') || ''
 };
 
 // Get the service from conversation context
 const service = localStorage.getItem('envirocareCurrentService') || 'General Inquiry';
 const enquiryDetails = `Interest in ${service} - Visitor chose not to elaborate further`;
 
 // Create enquiry without blocking the chat flow
 createEnquiry(visitorData, service, enquiryDetails)
 .then(() => console.log('✅ Enquiry created successfully'))
 .catch((error) => console.warn('⚠️ Could not create enquiry:', error));
 
 await pushBot('Perfect! I\'ve created an enquiry for you. Our team will reach out soon to assist you. Have a great day! 😇');
 } catch (error) {
 console.error('Error in end_confirm:', error);
 await pushBot('Thank you for your interest! Our team will reach out soon to assist you. Have a great day! 😇');
 }
 await pushBot('Is there anything else I can help you with today?');
 setConversationStep('end_confirm');
 setQuickReplies(['Continue chat', 'End chat']);
 }
 break;
 }

 case 'end_confirm': {
 if (choice === 'Continue chat') {
 await pushBot('Awesome, let’s keep going! What’s on your mind?');
 setConversationStep('free_text');
 } else {
 await pushBot('Thanks for chatting with Envirocare Labs! Feel free to reach out anytime. 😊');
 setConversationStep('free_text');
 setQuickReplies([]);
 setIsChatEnded(true);
 }
 break;
 }

 default:
 break;
 }
 } finally {
 setIsLoading(false);
 }
 };

 const sendMessage = async () => {
 if (!newMessage.trim() || !visitorId || isLoading) return;

 const visitorMessage: Message = {
 id: crypto.randomUUID(),
 message: newMessage,
 is_visitor: true,
 timestamp: new Date().toISOString()
 };

 setMessages(prev => [...prev, visitorMessage]);
 try {
 await appendMessage(visitorId, 'user', visitorMessage.message);
 } catch (error) {
 console.error('Error saving user message:', error);
 alert('Failed to save your message. Please try again.');
 }
 setNewMessage('');
 setIsLoading(true);

 try {
 // Check if we're in elaboration mode (user said "yes" to elaborate)
 if (conversationStep === 'free_text' && localStorage.getItem('envirocareWaitingForElaboration') === 'true') {
 console.log('🔄 Customer is elaborating, updating enquiry details...');
 
 try {
 // Update the enquiry details with the customer's elaboration
 const response = await fetch(`${API_BASE}/api/visitors/${visitorId}/enquiry-details`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 enquiryDetails: newMessage.trim()
 })
 });

 if (response.ok) {
 const result = await response.json();
 console.log('✅ Enquiry details updated successfully:', result);
 
 // Clear the elaboration flag
 localStorage.removeItem('envirocareWaitingForElaboration');
 
 // Create the enquiry with the elaborated details
 const visitorData = {
 name: localStorage.getItem('envirocareVisitorName') || '',
 email: localStorage.getItem('envirocareVisitorEmail') || '',
 phone: localStorage.getItem('envirocareVisitorPhone') || '',
 organization: localStorage.getItem('envirocareVisitorOrg') || ''
 };
 
 const service = localStorage.getItem('envirocareCurrentService') || 'General Inquiry';
 const enquiryDetails = newMessage.trim();
 
 // Create enquiry with elaborated details
 createEnquiry(visitorData, service, enquiryDetails)
 .then(() => console.log('✅ Enquiry created with elaborated details'))
 .catch((error) => console.warn('⚠️ Could not create enquiry:', error));
 
 const botResponse = 'Thank you for providing those details! I\'ve created a detailed enquiry for you. Our team will reach out soon to assist you with your specific needs. Have a great day! 😊';
 
 const botMessage: Message = {
 id: crypto.randomUUID(),
 message: botResponse,
 is_visitor: false,
 timestamp: new Date().toISOString()
 };
 setMessages(prev => [...prev, botMessage]);
 
 try {
 await appendMessage(visitorId, 'bot', botResponse);
 } catch (error) {
 console.error('Error saving bot response:', error);
 }
 
 setConversationStep('end_confirm');
 setQuickReplies(['Continue chat', 'End chat']);
 setIsLoading(false);
 return;
 } else {
 console.error('❌ Failed to update enquiry details:', response.status);
 }
 } catch (error) {
 console.error('❌ Error updating enquiry details:', error);
 }
 }

 await new Promise(resolve => setTimeout(resolve, 1000));

 let botResponse = '';
 const lowerMessage = newMessage.toLowerCase();

 if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
 botResponse = `Hi there! I'm Eva from Envirocare Labs. What's on your mind today? 😊`;
 } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
 botResponse = `I’m here to help with:\n• Exploring our services (Water, Food, Environmental Testing, etc.)\n• Answering questions about our lab\n• Scheduling assessments\n• Contact info\nWhat would you like to dive into?`;
 } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
 botResponse = `You can reach us at:\n📧 info@envirocarelabs.com\n📞 +1-555-0123\nWe're open Monday-Friday, 9AM-6PM EST. Want to explore our services too?`;
 setQuickReplies([...REPL_YES_NO, 'Ask another question']);
 setConversationStep('ask_explore');
 } else if (lowerMessage.includes('hours') || lowerMessage.includes('time') || lowerMessage.includes('open')) {
 botResponse = `Our hours are:\n🕘 Monday-Friday: 9AM-6PM EST\n🕘 Saturday: 10AM-4PM EST\n🕘 Sunday: Closed\nWe also offer 24/7 emergency support for urgent environmental issues. Anything else I can assist with?`;
 setQuickReplies(['Continue chat', 'End chat']);
 setConversationStep('end_confirm');
 } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing')) {
 botResponse = `Pricing depends on your needs:\n• Basic Assessment: $299\n• Comprehensive Analysis: $599\n• Custom Solutions: Contact us for a quote\nWould you like to discuss a specific service?`;
 setQuickReplies([...REPL_YES_NO, 'Ask another question']);
 setConversationStep('ask_explore');
 } else {
 botResponse = `I'd be happy to help you with our services, contact information, or any other questions you might have! 😊`;
 setQuickReplies(['Explore services', 'Ask another question']);
 setConversationStep('ask_explore');
 }

 const botMessage: Message = {
 id: crypto.randomUUID(),
 message: botResponse,
 is_visitor: false,
 timestamp: new Date().toISOString()
 };
 setMessages(prev => [...prev, botMessage]);
 try {
 await appendMessage(visitorId, 'bot', botResponse);
 } catch (error) {
 console.error('Error saving bot response:', error);
 alert('Failed to save bot response. Please try again.');
 }

 if (conversationStep === 'free_text' && !['contact', 'email', 'phone', 'hours', 'time', 'open', 'price', 'cost', 'pricing'].some(keyword => lowerMessage.includes(keyword))) {
 await appendMessage(visitorId, 'bot', 'Is there anything else I can help you with today?');
 setMessages(prev => [...prev, {
 id: crypto.randomUUID(),
 message: 'Is there anything else I can help you with today?',
 is_visitor: false,
 timestamp: new Date().toISOString()
 }]);
 setConversationStep('end_confirm');
 setQuickReplies(['Continue chat', 'End chat']);
 }
 } catch (error) {
 console.error('Error sending message:', error);
 const errorMessage: Message = {
 id: crypto.randomUUID(),
 message: 'Sorry, I encountered an error. Please try again.',
 is_visitor: false,
 timestamp: new Date().toISOString()
 };
 setMessages(prev => [...prev, errorMessage]);
 try {
 await appendMessage(visitorId, 'bot', errorMessage.message);
 } catch (err) {
 console.error('Failed to save error message:', err);
 }
 } finally {
 setIsLoading(false);
 }
 };

 const handleKeyPress = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter' && !e.shiftKey && conversationStep === 'free_text') {
 e.preventDefault();
 sendMessage();
 }
 };

 const handleTabChange = (tab: 'home' | 'chat' | 'faq' | 'articles') => {
 setActiveTab(tab);
 if (tab === 'home') {
 setShowVisitorForm(false);
 setShowChat(false);
 setShowFAQ(false);
 setShowArticles(false);
 } else if (tab === 'chat') {
 const storedVisitorId = localStorage.getItem('envirocareVisitorId');
 if (!isRegistered && !storedVisitorId) {
 setShowVisitorForm(true);
 setShowChat(false);
 } else if (storedVisitorId && !isRegistered) {
 setVisitorId(storedVisitorId);
 setIsRegistered(true);
 setShowVisitorForm(false);
 setShowChat(true);
 setConversationStep('free_text');
 setIsFetchingMessages(true);
 fetchMessages(storedVisitorId)
 .then((fetchedMessages) => {
 setMessages(fetchedMessages);
 if (fetchedMessages.length === 0) {
 const greeting = `Welcome back to Envirocare Labs, ${localStorage.getItem('envirocareVisitorName') || 'friend'}! I'm Eva, your Virtual Assistant. How can I assist you today? 😊`;
 const newMessage: Message = {
 id: crypto.randomUUID(),
 message: greeting,
 is_visitor: false,
 timestamp: new Date().toISOString()
 };
 setMessages([newMessage]);
 appendMessage(storedVisitorId, 'bot', greeting).catch((err) => {
 console.error('Failed to append greeting:', err);
 alert('Failed to save welcome message. Please try again.');
 });
 }
 })
 .catch((error) => {
 console.error('Error fetching messages:', error);
 const fallbackMessage: Message = {
 id: crypto.randomUUID(),
 message: 'Welcome back! I couldn’t load your previous chat. How can I assist you today?',
 is_visitor: false,
 timestamp: new Date().toISOString()
 };
 setMessages([fallbackMessage]);
 appendMessage(storedVisitorId, 'bot', fallbackMessage.message).catch((err) => {
 console.error('Failed to append fallback message:', err);
 });
 })
 .finally(() => setIsFetchingMessages(false));
 } else {
 setShowChat(true);
 }
 setShowFAQ(false);
 setShowArticles(false);
 } else if (tab === 'faq') {
 setShowFAQ(true);
 setShowVisitorForm(false);
 setShowChat(false);
 setShowArticles(false);
 } else if (tab === 'articles') {
 setShowArticles(true);
 setShowFAQ(false);
 setShowVisitorForm(false);
 setShowChat(false);
 }
 };

 // Iframe mode: fixed dimensions with border and shadow
 const containerClasses = isIframe 
 ? "w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col font-poppins overflow-hidden"
 : "fixed bottom-24 right-6 w-80 max-h-[70vh] h-[520px] bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden font-poppins flex flex-col backdrop-blur-sm bg-white/95";

 // If not open and not iframe, show the animated toggle button
 if (!isOpen && !isIframe) {
 return (
 <button
 onClick={onToggle}
 className="fixed bottom-6 right-6 z-50 group"
 aria-label="Open chat"
 style={{ animation: 'wiggle 2.5s ease-in-out infinite' }}
 >
 <div className="relative">
 {/* Main button with gradient */}
 <div className="w-16 h-16 bg-gradient-to-br from-[#2d4891] via-[#2557a7] to-[#16a34a] rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-3xl">
 <svg
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 strokeWidth={2}
 stroke="white"
 className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
 >
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
 />
 </svg>
 </div>
 
 {/* Pulsing ring animation */}
 <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2d4891] to-[#16a34a] opacity-75 animate-ping"></div>
 
 {/* Online indicator */}
 <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
 </div>
 
 <style jsx>{`
 @keyframes wiggle {
 0%, 100% {
 transform: rotate(0deg);
 }
 10%, 30%, 50%, 70%, 90% {
 transform: rotate(-3deg);
 }
 20%, 40%, 60%, 80% {
 transform: rotate(3deg);
 }
 }
 `}</style>
 </button>
 );
 }

 if (!isOpen) return null;

 return (
 <div className={containerClasses}>
 {/* Enhanced Header */}
 <div className={`text-white p-3 bg-gradient-to-r from-[#2d4891] to-[#1e3a8a] ${isIframe ? 'rounded-t-2xl' : 'rounded-t-3xl'}`}>
 <div className="flex items-center justify-center">
 <Image src="/envirocare-logo.png" alt="Envirocare Labs" width={180} height={45} className="drop-shadow-sm" />
 {!isIframe && (
 <button
 onClick={onToggle}
 className="text-white/80 hover:text-white transition-all duration-300 p-1 rounded-full hover:bg-white/20 absolute right-3 hover:rotate-90 hover:scale-110 active:scale-90 group"
 aria-label="Close chat"
 >
 <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 </div>
 </div>

 {/* Enhanced Content Area */}
 <div className="flex-1 p-1.5 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
 {activeTab === 'home' && !showVisitorForm && !showChat && !showFAQ && (
 <div className="text-center space-y-1 py-0.5">
 {/* Animated Welcome Section */}
 <div className="space-y-0.5 animate-fade-in">
 <div className="inline-block">
 <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded px-1.5 py-0.5 mb-0 shadow-sm border border-blue-100">
 <span className="text-[8px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-wide">👋 WELCOME TO ENVIROCARE</span>
 </div>
 </div>
 <h2 className="text-[10px] font-extrabold text-gray-900 leading-tight tracking-tight" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>
 Hey! How can we<br />help you today?
 </h2>
 <p className="text-[9px] text-gray-600 font-semibold max-w-sm mx-auto leading-tight">
 I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold text-[10px]">Eva</span>, your AI assistant.<br />
 <span className="text-[8px]">Let's get started! ✨</span>
 </p>
 </div>

 {/* Enhanced Action Buttons with Fun Animations */}
 <div className="space-y-1 px-0.5">
 <button
 onClick={() => handleTabChange('chat')}
 className="group w-full bg-gradient-to-r from-[#2d4891] via-[#2557a7] to-[#1e3a8a] text-white py-1.5 px-2 rounded-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-1 shadow-md hover:scale-105 active:scale-95 relative overflow-hidden transform hover:-translate-y-0.5"
 style={{ animation: 'bounce-subtle 3s ease-in-out infinite' }}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
 <svg className="w-3 h-3 relative z-10 group-hover:rotate-[360deg] group-hover:scale-125 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
 </svg>
 <span className="text-[10px] font-bold relative z-10 group-hover:tracking-wide transition-all duration-300">Chat with Eva now</span>
 <svg className="w-2.5 h-2.5 relative z-10 group-hover:translate-x-2 group-hover:scale-125 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
 </svg>
 </button>

 <button 
 onClick={() => window.open('https://envirocarelabs.com/blogs/', '_blank')}
 className="group w-full bg-white text-gray-700 py-1.5 px-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-200 hover:border-blue-400 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center space-x-1 transform hover:-translate-y-0.5">
 <svg className="w-2.5 h-2.5 text-blue-600 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
 </svg>
 <span className="text-[9px] font-bold group-hover:text-blue-600 transition-colors duration-300">Blogs / Events</span>
 <svg className="w-2 h-2 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
 </svg>
 </button>
 </div>
 
 <style jsx>{`
 @keyframes bounce-subtle {
 0%, 100% {
 transform: translateY(0);
 }
 50% {
 transform: translateY(-2px);
 }
 }
 `}</style>

 {/* Trust Indicators */}
 <div className="pt-1 border-t border-gray-100">
 <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
 <div className="flex items-center space-x-0.5">
 <svg className="w-2 h-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
 </svg>
 <span className="font-medium text-[7px]">24/7 Available</span>
 </div>
 <div className="flex items-center space-x-0.5">
 <svg className="w-2 h-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
 </svg>
 <span className="font-medium text-[7px]">Instant Replies</span>
 </div>
 </div>
 </div>
 </div>
 )}

 {showVisitorForm && (
 <div className="space-y-1">
 <div className="text-center">
 <h3 className="text-sm font-extrabold text-gray-900 mb-0.5 leading-tight" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>Welcome to Envirocare Labs!</h3>
 <p className="text-gray-700 text-[8px] font-medium leading-tight">Please provide your details to start the conversation!</p>
 </div>
 <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-1.5" noValidate>
 <div>
 <label htmlFor="name" className="block text-xs font-bold text-gray-800 mb-1">
 Name
 </label>
 <div className="relative">
 <input
 id="name"
 {...register('name', validationRules.name)}
 placeholder="Enter your name"
 onBlur={() => trigger('name')}
 aria-label="Name"
 aria-invalid={errors.name ? 'true' : 'false'}
 aria-describedby={errors.name ? 'name-error' : undefined}
 className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 text-xs font-medium ${getFieldStateClass('name')}`}
 />
 {isFieldValid('name') && <SuccessIcon />}
 </div>
 {errors.name && (
 <div id="name-error">
 <ErrorMessage message={errors.name.message || ''} />
 </div>
 )}
 </div>
 <div>
 <label htmlFor="email" className="block text-xs font-bold text-gray-800 mb-1">
 Email
 </label>
 <div className="relative">
 <input
 id="email"
 type="email"
 {...register('email', validationRules.email)}
 placeholder="Enter your email"
 onBlur={() => trigger('email')}
 aria-label="Email"
 aria-invalid={errors.email ? 'true' : 'false'}
 aria-describedby={errors.email ? 'email-error' : undefined}
 className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 text-xs font-medium ${getFieldStateClass('email')}`}
 />
 {isFieldValid('email') && <SuccessIcon />}
 </div>
 {errors.email && (
 <div id="email-error">
 <ErrorMessage message={errors.email.message || ''} />
 </div>
 )}
 </div>
 <div>
 <label htmlFor="phone" className="block text-xs font-bold text-gray-800 mb-1">
 Phone Number
 </label>
 <div className="relative">
 <div className="flex items-stretch">
 {/* Country Code Dropdown */}
 <div className="relative country-dropdown">
 <button
 type="button"
 onClick={() => setShowCountryDropdown(!showCountryDropdown)}
 className="flex items-center justify-center px-3 py-3 border-2 border-r-0 border-gray-200 rounded-l-xl bg-white/80 backdrop-blur-sm text-gray-900 hover:bg-gray-50 transition-all duration-200 w-24 h-12 focus:outline-none focus:ring-2 focus:ring-[#2d4891] focus:border-transparent"
 >
 <span className="text-sm font-medium flex items-center">
 <span className="mr-1">{COUNTRY_CODES.find(c => c.code === selectedCountryCode)?.flag}</span>
 <span>{selectedCountryCode}</span>
 </span>
 <svg className="w-3 h-3 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </button>
 
 {showCountryDropdown && (
 <div className="absolute top-full left-0 z-50 w-72 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl mt-1">
 <div className="p-1">
 <div className="text-xs font-medium text-gray-800 mb-1 px-3 py-2 border-b border-gray-100">Select Country</div>
 {COUNTRY_CODES.map((country) => (
 <button
 key={country.code}
 type="button"
 onClick={() => {
 setSelectedCountryCode(country.code);
 setShowCountryDropdown(false);
 }}
 className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors ${
 selectedCountryCode === country.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
 }`}
 >
 <span className="mr-3 text-base">{country.flag}</span>
 <span className="font-medium mr-3 w-12 text-left">{country.code}</span>
 <span className="text-gray-900 truncate">{country.country}</span>
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 
 {/* Phone Number Input */}
 <div className="flex-1 relative">
 <input
 id="phone"
 type="tel"
 {...register('phone', validationRules.phone)}
 placeholder="Enter your phone number"
 onBlur={() => trigger('phone')}
 aria-label="Phone Number"
 aria-invalid={errors.phone ? 'true' : 'false'}
 aria-describedby={errors.phone ? 'phone-error' : undefined}
 className={`w-full px-4 py-3 border-2 rounded-r-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 h-12 ${getFieldStateClass('phone')}`}
 />
 {isFieldValid('phone') && (
 <svg 
 className="w-5 h-5 text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2 animate-slideIn" 
 fill="currentColor" 
 viewBox="0 0 20 20"
 aria-hidden="true"
 >
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
 </svg>
 )}
 </div>
 </div>
 </div>
 {errors.phone && (
 <div id="phone-error">
 <ErrorMessage message={errors.phone.message || ''} />
 </div>
 )}
 </div>
 <button
 type="submit"
 disabled={isLoading || Object.keys(errors).length > 0}
 aria-label="Start Chat"
 className="w-full bg-gradient-to-r from-[#2d4891] to-[#1e3a8a] text-white py-3 px-6 rounded-xl hover:from-[#1e3a8a] hover:to-[#1e3a8a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
 >
 {isLoading ? (
 <div className="flex items-center justify-center space-x-2">
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
 <span>Starting Chat...</span>
 </div>
 ) : (
 'Start Chat'
 )}
 </button>
 </form>
 </div>
 )}

 {showChat && isRegistered && (
 <div className="space-y-2">
 <div className="flex justify-end mb-2">
 <button
 onClick={resetChat}
 className="text-[9px] text-[#2d4891] hover:text-[#1e3a8a] hover:underline transition-colors duration-200 px-2 py-0.5 rounded-lg hover:bg-blue-50 font-semibold"
 >
 Start New Chat
 </button>
 </div>
 {messages.map((message) => (
 <div
 key={message.id}
 className={`flex ${message.is_visitor ? 'justify-end' : 'justify-start'}`}
 >
 <div
 className={`max-w-xs px-2.5 py-2 rounded-lg ${
 message.is_visitor
 ? 'bg-gradient-to-r from-[#2d4891] to-[#1e3a8a] shadow-md'
 : 'bg-white shadow-sm border border-gray-100'
 }`}
 style={message.is_visitor ? { color: '#ffffff' } : {}}
 >
 <p 
 className={`text-[9px] whitespace-pre-line leading-relaxed font-bold ${message.is_visitor ? 'text-white' : 'text-gray-800'}`}
 style={message.is_visitor ? { color: '#ffffff !important' } : {}}
 >
 {message.message}
 </p>
 <p 
 className={`text-[7px] mt-1 font-bold ${message.is_visitor ? 'text-white' : 'text-gray-500'}`}
 style={message.is_visitor ? { color: '#ffffff !important', opacity: 0.95 } : {}}
 >
 {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </p>
 </div>
 </div>
 ))}
 {(isLoading || isFetchingMessages) && (
 <div className="flex justify-start">
 <div className="bg-white text-gray-800 px-2.5 py-2 rounded-lg shadow-sm border border-gray-100">
 <div className="flex space-x-1">
 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
 <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
 </div>
 </div>
 </div>
 )}
 {quickReplies.length > 0 && !isLoading && !isFetchingMessages && (
 <div className="flex justify-start mt-2">
 <div className="grid grid-cols-2 gap-1.5 w-full">
 {quickReplies.map((reply, index) => (
 <button
 key={index}
 onClick={() => handleQuickReply(reply)}
 disabled={isLoading}
 style={{ animationDelay: `${index * 50}ms` }}
 className={`px-2.5 py-2 rounded-lg border-2 transition-all duration-300 shadow-sm text-[9px] font-semibold text-center transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 animate-slide-in-up ${
 ['Previous', 'Next', 'Back'].includes(reply) 
 ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-100 hover:border-gray-400 hover:shadow-lg' 
 : 'bg-gradient-to-r from-white to-blue-50 text-[#2d4891] border-[#2d4891] hover:bg-gradient-to-r hover:from-[#2d4891] hover:to-[#1e3a8a] hover:text-white hover:shadow-xl hover:border-[#1e3a8a]'
 } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0`}
 >
 <span className="inline-flex items-center justify-center gap-1">
 {reply}
 {!['Previous', 'Next', 'Back'].includes(reply) && (
 <svg className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
 </svg>
 )}
 </span>
 </button>
 ))}
 </div>
 </div>
 )}
 
 <style jsx>{`
 @keyframes slide-in-up {
 from {
 opacity: 0;
 transform: translateY(10px);
 }
 to {
 opacity: 1;
 transform: translateY(0);
 }
 }
 .animate-slide-in-up {
 animation: slide-in-up 0.3s ease-out forwards;
 }
 `}</style>
 <div ref={messagesEndRef} />
 </div>
 )}

 {showFAQ && (
 <div className="space-y-2">
 <div className="flex items-center space-x-2 mb-3">
 <div className="w-8 h-8 bg-gradient-to-r from-[#2d4891] to-[#1e3a8a] rounded-full flex items-center justify-center shadow-md">
 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <h3 className="font-extrabold text-gray-900 text-[11px]" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>Search FAQ</h3>
 </div>
 
 {/* Search Bar */}
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
 <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 </div>
 <input
 type="text"
 placeholder="Search FAQs..."
 value={faqSearchQuery}
 onChange={(e) => setFaqSearchQuery(e.target.value)}
 className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d4891] focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-[10px] placeholder:text-gray-400"
 />
 </div>

 {/* Search Results Count */}
 {faqSearchQuery && (
 <div className="text-[9px] text-gray-600 text-center py-1">
 Found {filteredFaqs.length} FAQ{filteredFaqs.length !== 1 ? 's' : ''} for &quot;{faqSearchQuery}&quot;
 </div>
 )}

 {/* FAQ List */}
 <div className="space-y-2 max-h-64 overflow-y-auto">
 {filteredFaqs.length > 0 ? (
 filteredFaqs.map((faq) => (
 <div key={faq.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#2d4891] transition-all duration-200">
 <div className="p-2.5 cursor-pointer group" onClick={() => {
 const element = document.getElementById(`faq-answer-${faq.id}`);
 if (element) {
 element.classList.toggle('hidden');
 }
 }}>
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <h4 className="text-[10px] font-bold text-gray-900 group-hover:text-[#2d4891] transition-colors duration-200 leading-tight">
 {faq.question}
 </h4>
 <div className="flex items-center space-x-1.5 mt-1">
 <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-blue-50 text-[#2d4891] border border-blue-200">
 {faq.category}
 </span>
 <span className="text-[8px] text-gray-500">{faq.tags.slice(0, 2).join(', ')}</span>
 </div>
 </div>
 <svg className="w-4 h-4 text-gray-500 group-hover:text-[#2d4891] transition-colors duration-200 transform group-hover:rotate-180 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
 </svg>
 </div>
 </div>
 <div id={`faq-answer-${faq.id}`} className="hidden px-2.5 pb-2.5">
 <div className="pt-2 border-t border-gray-100">
 <p className="text-[9px] text-gray-700 leading-relaxed">{faq.answer}</p>
 <div className="flex flex-wrap gap-1 mt-2">
 {faq.tags.map((tag: string, index: number) => (
 <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[7px] font-medium bg-gray-100 text-gray-600">
 #{tag}
 </span>
 ))}
 </div>
 </div>
 </div>
 </div>
 ))
 ) : faqSearchQuery ? (
 <div className="text-center py-6">
 <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
 <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
 </svg>
 </div>
 <p className="text-gray-700 text-[10px] font-semibold">No FAQs found for &quot;{faqSearchQuery}&quot;</p>
 <p className="text-gray-500 text-[8px] mt-0.5">Try different keywords or browse all FAQs</p>
 </div>
 ) : (
 <div className="text-center py-3">
 <p className="text-gray-500 text-[9px]">Type in the search bar above to find FAQs</p>
 </div>
 )}
 </div>
 </div>
 )}

 {showArticles && (
 <div className="space-y-2">
 <div className="flex items-center space-x-2 mb-3">
 <div className="w-8 h-8 bg-gradient-to-r from-[#2d4891] to-[#1e3a8a] rounded-full flex items-center justify-center shadow-md">
 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 </div>
 <h3 className="font-extrabold text-gray-900 text-[11px]" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>Search Articles</h3>
 </div>
 
 {/* Search Bar */}
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
 <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
 </svg>
 </div>
 <input
 type="text"
 placeholder="Search articles..."
 value={articlesSearchQuery}
 onChange={(e) => setArticlesSearchQuery(e.target.value)}
 className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2d4891] focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-[10px] placeholder:text-gray-400"
 />
 </div>

 {/* Search Results Count */}
 {articlesSearchQuery && (
 <div className="text-[9px] text-gray-600 text-center py-1">
 Found {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} for &quot;{articlesSearchQuery}&quot;
 </div>
 )}

 {/* Articles List */}
 <div className="space-y-2 max-h-64 overflow-y-auto">
 {filteredArticles.length > 0 ? (
 filteredArticles.map((article) => (
 <div key={article.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#2d4891] transition-all duration-200">
 <div className="p-2.5 cursor-pointer group" onClick={() => {
 const element = document.getElementById(`article-excerpt-${article.id}`);
 if (element) {
 element.classList.toggle('hidden');
 }
 }}>
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <h4 className="text-[10px] font-bold text-gray-900 group-hover:text-[#2d4891] transition-colors duration-200 leading-tight">
 {article.title}
 </h4>
 <div className="flex items-center space-x-1.5 mt-1">
 <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-blue-50 text-[#2d4891] border border-blue-200">
 {article.category}
 </span>
 <span className="text-[8px] text-gray-500">{article.readTime}</span>
 </div>
 <div className="flex flex-wrap gap-1 mt-1">
 {article.tags.slice(0, 2).map((tag: string, index: number) => (
 <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[7px] font-medium bg-gray-100 text-gray-600">
 #{tag}
 </span>
 ))}
 {article.tags.length > 2 && (
 <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[7px] font-medium bg-gray-200 text-gray-700">
 +{article.tags.length - 2}
 </span>
 )}
 </div>
 </div>
 <svg className="w-4 h-4 text-gray-500 group-hover:text-[#2d4891] transition-colors duration-200 transform group-hover:rotate-180 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
 </svg>
 </div>
 </div>
 <div id={`article-excerpt-${article.id}`} className="hidden px-2.5 pb-2.5">
 <div className="pt-2 border-t border-gray-100">
 <p className="text-[9px] text-gray-700 leading-relaxed mb-2">{article.excerpt}</p>
 <div className="flex items-center justify-between">
 <div className="flex flex-wrap gap-1">
 {article.tags.slice(0, 3).map((tag: string, index: number) => (
 <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[7px] font-medium bg-gray-100 text-gray-600">
 #{tag}
 </span>
 ))}
 </div>
 <button className="inline-flex items-center px-2 py-1 rounded-lg text-[8px] font-bold bg-[#2d4891] text-white hover:bg-[#1e3a8a] transition-colors duration-200 shadow-sm">
 Read More
 </button>
 </div>
 </div>
 </div>
 </div>
 ))
 ) : articlesSearchQuery ? (
 <div className="text-center py-6">
 <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
 <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
 </svg>
 </div>
 <p className="text-gray-700 text-[10px] font-semibold">No articles found for &quot;{articlesSearchQuery}&quot;</p>
 <p className="text-gray-500 text-[8px] mt-0.5">Try different keywords or browse all articles</p>
 </div>
 ) : (
 <div className="text-center py-3">
 <p className="text-gray-500 text-[9px]">Type in the search bar above to find articles</p>
 </div>
 )}
 </div>
 </div>
 )}
 </div>

 {/* Enhanced Chat Input */}
 {showChat && isRegistered && (
 <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
 {conversationStep === 'free_text' && !isChatEnded && (
 <div className="flex space-x-3">
 <input
 type="text"
 value={newMessage}
 onChange={(e) => setNewMessage(e.target.value)}
 onKeyPress={handleKeyPress}
 placeholder="Type your message here..."
 className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d4891] focus:border-transparent transition-all duration-200 bg-white/90 backdrop-blur-sm text-black"
 disabled={isLoading}
 />
 <button
 onClick={sendMessage}
 disabled={!newMessage.trim() || isLoading}
 className="group bg-gradient-to-r from-[#2d4891] via-[#2557a7] to-[#1e3a8a] text-white px-6 py-3 rounded-xl hover:from-[#1e3a8a] hover:via-[#2557a7] hover:to-[#2d4891] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 disabled:transform-none font-semibold relative overflow-hidden"
 >
 <span className="relative z-10 flex items-center gap-2">
 Send
 <svg className="w-4 h-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
 </svg>
 </span>
 <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
 </button>
 </div>
 )}
 </div>
 )}

 {/* Enhanced Bottom Navigation */}
 <div className="bg-white/90 backdrop-blur-sm border-t border-gray-100 p-2">
 <div className="flex justify-around">
 {[
 { key: 'home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Home' },
 { key: 'chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: 'Chat' },
 { key: 'faq', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'FAQ' },
 { key: 'articles', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Articles' }
 ].map(({ key, icon, label }) => (
 <button
 key={key}
 onClick={() => handleTabChange(key as 'home' | 'chat' | 'faq' | 'articles')}
 className={`group flex flex-col items-center space-y-0.5 p-1.5 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
 activeTab === key 
 ? 'text-[#2d4891] bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm scale-105' 
 : 'text-gray-600 hover:text-[#2d4891] hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
 }`}
 >
 <svg className={`w-4 h-4 transition-all duration-300 ${activeTab === key ? 'scale-110' : 'group-hover:scale-110 group-hover:-translate-y-0.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={activeTab === key ? 2.5 : 2} d={icon} />
 </svg>
 <span className={`text-[5px] font-medium leading-none transition-all duration-300 ${activeTab === key ? 'font-bold' : ''}`}>{label}</span>
 {activeTab === key && (
 <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-[#2d4891] to-[#16a34a] rounded-full"></div>
 )}
 </button>
 ))}
 </div>
 </div>
 </div>
 );
}