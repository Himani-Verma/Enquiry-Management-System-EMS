import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Visitor from '@/lib/models/Visitor';
import ChatMessage from '@/lib/models/ChatMessage';

// POST /api/chat/[visitorId]/messages - Create chat message
export async function POST(
 request: NextRequest,
 { params }: { params: { visitorId: string } }
) {
 try {
 console.log(`💬 POST /api/chat/${params.visitorId}/messages - Saving chat message`);
 
 await connectMongo();
 
 const { visitorId } = params;
 const { sender, message } = await request.json();

 console.log(`📝 Message details: sender=${sender}, messageLength=${message?.length}`);

 if (!sender || !['user', 'bot'].includes(sender) || !message) {
 console.error(`❌ Invalid message data: sender=${sender}, message=${message ? 'present' : 'missing'}`);
 return NextResponse.json({ 
 ok: false, 
 message: 'sender and message are required' 
 }, { status: 400 });
 }

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

 // Create chat message
 const chatMessage = await ChatMessage.create({ 
 visitorId, 
 sender, 
 text: message, // Save to text field to match existing database structure
 message, // Also save to message field for forward compatibility
 at: new Date() 
 });

 console.log(`✅ Chat message saved: ${chatMessage._id}`);

 // Update visitor's last interaction
 visitor.lastInteractionAt = new Date();
 await visitor.save();

 console.log(`✅ Visitor lastInteractionAt updated`);

 return NextResponse.json({ ok: true, messageId: chatMessage._id });

 } catch (error) {
 console.error('❌ Chat message creation error:', error);
 return NextResponse.json({ 
 ok: false, 
 message: 'Failed to create chat message',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500 });
 }
}

// GET /api/chat/[visitorId]/messages - Get chat messages for visitor
export async function GET(
 request: NextRequest,
 { params }: { params: { visitorId: string } }
) {
 try {
 await connectMongo();
 
 const { visitorId } = params;
 const { searchParams } = new URL(request.url);
 const limit = parseInt(searchParams.get('limit') || '50');

 const visitor = await Visitor.findById(visitorId);
 if (!visitor) {
 return NextResponse.json({ 
 ok: false, 
 message: 'Visitor not found' 
 }, { status: 404 });
 }

 // Get chat messages for this visitor
 const messages = await ChatMessage.find({ visitorId })
 .sort({ createdAt: 1 }) // Use createdAt from timestamps
 .limit(limit)
 .lean();

 return NextResponse.json({
 ok: true,
 messages: messages.map((msg: any) => ({
 _id: msg._id.toString(),
 visitorId: msg.visitorId.toString(),
 sender: msg.sender,
 message: msg.text || msg.message, // Database uses 'text' field, API expects 'message'
 at: (msg.createdAt || msg.at)?.toISOString() // Convert to ISO string for frontend compatibility
 }))
 });

 } catch (error) {
 console.error('Chat messages fetch error:', error);
 return NextResponse.json({ 
 ok: false, 
 message: 'Failed to fetch chat messages' 
 }, { status: 500 });
 }
}
