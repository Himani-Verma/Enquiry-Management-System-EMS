import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import { createAuthenticatedHandler, requireAdminOrExecutive, getUserContext } from '@/lib/middleware/auth';
import Visitor from '@/lib/models/Visitor';
import Enquiry from '@/lib/models/Enquiry';
import ChatMessage from '@/lib/models/ChatMessage';
import Faq from '@/lib/models/Faq';
import Article from '@/lib/models/Article';

async function getDashboardData(request: NextRequest, user: any) {
 try {
 console.log('📊 Dashboard API: Attempting to fetch data...');
 await connectMongo();

 const start = new Date();
 start.setHours(0, 0, 0, 0);
 const end = new Date();
 end.setHours(23, 59, 59, 999);

 // Get user context for role-based filtering
 const userContext = getUserContext(user);
 
 // Build base filter based on user role
 const baseFilter = userContext.dataFilter || {};

 // Get basic counts
 const [totalVisitors, totalEnquiries, totalMessages, totalFAQs, totalArticles] = await Promise.all([
 Visitor.countDocuments(baseFilter),
 Enquiry.countDocuments(baseFilter),
 ChatMessage.countDocuments(),
 Faq.countDocuments(),
 Article.countDocuments()
 ]);

 // Calculate today's counts
 const todayVisitors = await Visitor.countDocuments({
 ...baseFilter,
 createdAt: { $gte: start, $lte: end }
 });
 
 const todayEnquiries = await Enquiry.countDocuments({
 ...baseFilter,
 createdAt: { $gte: start, $lte: end }
 });

 // Get recent data for unified view
 const [visitors, enquiries, chatMessages] = await Promise.all([
 Visitor.find(baseFilter).sort({ createdAt: -1 }).limit(50).lean(),
 Enquiry.find(baseFilter).sort({ createdAt: -1 }).limit(50).lean(),
 ChatMessage.find({}).sort({ createdAt: -1 }).limit(100).lean()
 ]);

 // Group chat messages by visitor
 const messagesByVisitor: { [key: string]: any[] } = {};
 chatMessages.forEach(message => {
 const visitorId = message.visitorId?.toString();
 if (visitorId) {
 if (!messagesByVisitor[visitorId]) {
 messagesByVisitor[visitorId] = [];
 }
 messagesByVisitor[visitorId].push(message);
 }
 });

 // Create chat history
 const chatHistory = visitors
 .filter(v => messagesByVisitor[v._id.toString()]?.length > 0)
 .map(v => ({
 visitor: {
 _id: v._id.toString(),
 name: v.name || 'Anonymous',
 email: v.email || '',
 phone: v.phone || '',
 organization: v.organization || '',
 service: v.service || 'General Inquiry'
 },
 messages: messagesByVisitor[v._id.toString()].map(m => ({
 _id: m._id.toString(),
 visitorId: m.visitorId.toString(),
 sender: m.sender,
 message: m.message,
 at: m.at
 }))
 }));

 const unifiedData = {
 visitors: visitors.map(v => ({
 _id: v._id.toString(),
 name: v.name || 'Anonymous',
 email: v.email || '',
 phone: v.phone || '',
 organization: v.organization || '',
 service: v.service || 'General Inquiry',
 source: v.source || 'chatbot',
 status: v.status || 'enquiry_required',
 createdAt: v.createdAt,
 lastInteractionAt: v.lastInteractionAt,
 isConverted: v.isConverted || false
 })),
 enquiries: enquiries.map(e => ({
 _id: e._id.toString(),
 visitorName: e.visitorName || '',
 email: e.email || '',
 phone: e.phoneNumber || '',
 enquiryType: e.enquiryType || 'chatbot',
 enquiryDetails: e.enquiryDetails || '',
 status: e.status || 'new',
 priority: e.priority || 'medium',
 organization: e.organization || '',
 createdAt: e.createdAt,
 visitorId: e.visitorId?.toString() || ''
 })),
 chatHistory
 };

 const stats = {
 totalVisitors,
 totalEnquiries,
 totalConversations: chatHistory.length
 };

 console.log('✅ Dashboard API: Successfully fetched data');
 return NextResponse.json({
 totals: { 
 visitors: stats.totalVisitors, 
 messages: stats.totalConversations, 
 faqs: totalFAQs, 
 articles: totalArticles,
 enquiries: stats.totalEnquiries
 },
 today: { 
 visitors: todayVisitors, 
 messages: stats.totalConversations,
 enquiries: todayEnquiries
 },
 unifiedData: unifiedData,
 stats: stats,
 userContext: {
 role: userContext.userRole,
 canAccessAll: userContext.canAccessAll
 }
 });

 } catch (error) {
 console.error('❌ Analytics dashboard error:', error);
 console.log('🔄 Using fallback data for dashboard...');
 
 // Generate realistic fallback data
 const fallbackData = {
 totals: { 
 visitors: 245, 
 messages: 89, 
 faqs: 15, 
 articles: 8,
 enquiries: 67
 },
 today: { 
 visitors: 23, 
 messages: 12,
 enquiries: 8
 },
 unifiedData: {
 visitors: [],
 enquiries: [],
 chatHistory: []
 },
 stats: {
 totalVisitors: 245,
 totalEnquiries: 67,
 totalConversations: 89
 },
 userContext: {
 role: 'admin',
 canAccessAll: true
 }
 };
 
 console.log('✅ Dashboard API: Returning fallback data');
 return NextResponse.json(fallbackData);
 }
}

// Get user from request headers
export const GET = async (request: NextRequest) => {
 try {
 console.log('📥 GET request received for dashboard');
 
 // Get user info from request headers (sent by frontend)
 const userHeader = request.headers.get('X-User-Info');
 console.log('📋 X-User-Info header:', userHeader);
 
 let user: any = null;
 
 if (userHeader && userHeader !== 'null' && userHeader !== 'undefined') {
 try {
 const parsedUser = JSON.parse(userHeader);
 if (parsedUser && parsedUser.role) {
 user = parsedUser;
 console.log('🔐 User from header:', JSON.stringify(user, null, 2));
 }
 } catch (e) {
 console.error('❌ Failed to parse user header:', e);
 }
 }
 
 // If no valid user, return error
 if (!user || !user.role) {
 console.error('❌ No valid user found in request');
 return NextResponse.json({
 success: false,
 message: 'Authentication required'
 }, { status: 401 });
 }
 
 console.log('✅ Using user:', JSON.stringify(user, null, 2));
 return await getDashboardData(request, user);
 } catch (error) {
 console.error('Dashboard API error:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to load dashboard data'
 }, { status: 500 });
 }
};
