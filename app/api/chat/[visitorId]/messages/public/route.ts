import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Visitor from '@/lib/models/Visitor';
import ChatMessage from '@/lib/models/ChatMessage';

// GET /api/chat/[visitorId]/messages/public - Get chat messages for visitor (public endpoint for chatbot)
export async function GET(
 request: NextRequest,
 { params }: { params: { visitorId: string } }
) {
 try {
 console.log(`🔍 GET /api/chat/${params.visitorId}/messages/public - Fetching public chat messages`);
 
 await connectMongo();
 
 const { visitorId } = params;
 const { searchParams } = new URL(request.url);
 const limit = parseInt(searchParams.get('limit') || '50');

 console.log(`🔍 Looking for visitor: ${visitorId}`);
 const visitor = await Visitor.findById(visitorId);
 if (!visitor) {
 console.error(`❌ Visitor not found: ${visitorId}`);
 return NextResponse.json({ 
 ok: false, 
 message: 'Visitor not found' 
 }, { status: 404 });
 }

 console.log(`✅ Visitor found: ${visitor.name} (${visitor.email})`);

 // Get chat messages for this visitor
 const messages = await ChatMessage.find({ visitorId })
 .sort({ createdAt: 1 }) // Use createdAt since that's what the schema provides
 .limit(limit)
 .lean();

 console.log(`📊 Found ${messages.length} messages for visitor ${visitorId}`);

 return NextResponse.json({
 ok: true,
 messages: messages.map((msg: any) => ({
 _id: msg._id.toString(),
 visitorId: msg.visitorId.toString(),
 sender: msg.sender,
 message: msg.text || msg.message, // Handle both field names for compatibility
 at: (msg.createdAt || msg.at)?.toISOString() // Convert to ISO string for frontend compatibility
 }))
 });

 } catch (error) {
 console.error('❌ Public chat messages fetch error:', error);
 return NextResponse.json({ 
 ok: false, 
 message: 'Failed to fetch chat messages',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500 });
 }
}