import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Visitor from '@/lib/models/Visitor';
import ChatMessage from '@/lib/models/ChatMessage';
import { createAuthenticatedHandler, requireAdminOrExecutive } from '@/lib/middleware/auth';

async function getChatHistory(request: NextRequest, user: any) {
 try {
 console.log('🔄 GET /api/chat-history - Fetching chat history');
 
 await connectMongo();
 console.log('✅ Connected to MongoDB');

 const { searchParams } = new URL(request.url);
 const limit = parseInt(searchParams.get('limit') || '50');
 const page = parseInt(searchParams.get('page') || '1');
 const search = searchParams.get('search') || '';
 const source = searchParams.get('source') || '';

 console.log('📊 Chat history filters:', { limit, page, search, source });

 // Build filter for visitors
 let visitorFilter: any = {};
 
 // Add search filter
 if (search) {
 visitorFilter.$or = [
 { name: { $regex: search, $options: 'i' } },
 { email: { $regex: search, $options: 'i' } },
 { phone: { $regex: search, $options: 'i' } },
 { organization: { $regex: search, $options: 'i' } }
 ];
 }

 // Add source filter
 if (source) {
 visitorFilter.source = source;
 }

 // Get visitors with chat messages
 const visitors = await Visitor.find(visitorFilter)
 .sort({ lastInteractionAt: -1, createdAt: -1 })
 .limit(limit)
 .skip((page - 1) * limit)
 .lean();

 console.log(`📊 Found ${visitors.length} visitors`);

 // Get chat messages for each visitor
 const visitorsWithMessages = await Promise.all(
 visitors.map(async (visitor) => {
 const messages = await ChatMessage.find({ visitorId: visitor._id })
 .sort({ createdAt: 1 }) // Use createdAt from timestamps
 .lean();

 console.log(`📨 Visitor ${visitor._id} (${visitor.name}) has ${messages.length} messages`);

 return {
 ...visitor,
 messageCount: messages.length,
 lastMessage: messages.length > 0 ? messages[messages.length - 1] : null,
 messages: messages.map(msg => ({
 _id: msg._id.toString(),
 visitorId: msg.visitorId.toString(),
 sender: msg.sender,
 message: msg.text || msg.message, // Database uses 'text' field, API expects 'message'
 at: (msg.createdAt || msg.at)?.toISOString() // Convert to ISO string for frontend compatibility
 }))
 };
 })
 );

 // Filter to only include visitors who have at least one message
 const visitorsWithActualMessages = visitorsWithMessages.filter(v => v.messageCount > 0);
 
 // Sort visitors - those with message content first, then by last interaction
 visitorsWithActualMessages.sort((a, b) => {
 const aHasContent = a.messages.some(m => (m.message && m.message.trim()) || (m.text && m.text.trim()));
 const bHasContent = b.messages.some(m => (m.message && m.message.trim()) || (m.text && m.text.trim()));
 
 if (aHasContent && !bHasContent) return -1;
 if (!aHasContent && bHasContent) return 1;
 
 // If both have content or both don't, sort by last interaction
 const aTime = new Date(a.lastInteractionAt || a.createdAt).getTime();
 const bTime = new Date(b.lastInteractionAt || b.createdAt).getTime();
 return bTime - aTime;
 });
 
 console.log(`📊 Filtered to ${visitorsWithActualMessages.length} visitors with actual messages (from ${visitorsWithMessages.length} total)`);

 // Get total count for pagination
 const totalVisitors = await Visitor.countDocuments(visitorFilter);

 console.log(`✅ Chat history fetched: ${visitorsWithActualMessages.length} visitors with messages`);

 return NextResponse.json({
 success: true,
 visitors: visitorsWithActualMessages,
 pagination: {
 page,
 limit,
 total: visitorsWithActualMessages.length,
 totalPages: Math.ceil(visitorsWithActualMessages.length / limit)
 }
 });

 } catch (error) {
 console.error('❌ Chat history API error:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to fetch chat history',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500 });
 }
}

export const GET = createAuthenticatedHandler(getChatHistory, requireAdminOrExecutive);
