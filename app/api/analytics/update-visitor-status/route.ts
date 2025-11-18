import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Visitor from '@/lib/models/Visitor';

async function updateVisitorStatus(request: NextRequest, user: any) {
 try {
 console.log('🔄 PUT /api/analytics/update-visitor-status - Updating visitor status');
 
 await connectMongo();
 console.log('✅ Connected to MongoDB');

 const body = await request.json();
 console.log('📝 Request body:', body);

 const { visitorId, status, notes } = body;

 // Validate required fields
 if (!visitorId) {
 return NextResponse.json({
 success: false,
 message: 'Visitor ID is required'
 }, { status: 400 });
 }

 if (!status) {
 return NextResponse.json({
 success: false,
 message: 'Status is required'
 }, { status: 400 });
 }

 // Find the visitor
 const visitor = await Visitor.findById(visitorId);
 
 if (!visitor) {
 return NextResponse.json({
 success: false,
 message: 'Visitor not found'
 }, { status: 404 });
 }

 // Check if this is a conversion (status changed to 'converted')
 const isConversion = status === 'converted' && visitor.status !== 'converted';
 
 // Prepare update data
 const updateData: any = {
 status,
 lastModifiedBy: user.username || 'admin',
 lastModifiedAt: new Date()
 };

 // If this is a conversion, track who converted it
 if (isConversion) {
 updateData.isConverted = true;
 updateData.convertedBy = user.name || user.username || 'admin';
 updateData.convertedAt = new Date();
 console.log('🎯 Visitor converted by:', updateData.convertedBy);
 }

 // Add to pipeline history
 const historyEntry = {
 status,
 changedAt: new Date(),
 changedBy: user.username || 'admin',
 notes: notes || ''
 };

 // Push to pipeline history
 updateData.$push = {
 pipelineHistory: historyEntry
 };

 // Update the visitor
 const updatedVisitor = await Visitor.findByIdAndUpdate(
 visitorId,
 updateData,
 { new: true, runValidators: true }
 );

 console.log('✅ Visitor status updated successfully:', updatedVisitor._id);

 // Return the complete updated visitor object
 return NextResponse.json({
 success: true,
 message: 'Visitor status updated successfully',
 _id: updatedVisitor._id.toString(),
 name: updatedVisitor.name,
 email: updatedVisitor.email,
 phone: updatedVisitor.phone,
 organization: updatedVisitor.organization,
 region: updatedVisitor.region,
 service: updatedVisitor.service,
 subservice: updatedVisitor.subservice,
 enquiryDetails: updatedVisitor.enquiryDetails,
 source: updatedVisitor.source,
 status: updatedVisitor.status,
 createdAt: updatedVisitor.createdAt,
 lastInteractionAt: updatedVisitor.lastInteractionAt,
 isConverted: updatedVisitor.isConverted,
 agent: updatedVisitor.agent,
 agentName: updatedVisitor.agentName,
 assignedAgent: updatedVisitor.assignedAgent,
 salesExecutive: updatedVisitor.salesExecutive,
 salesExecutiveName: updatedVisitor.salesExecutiveName,
 customerExecutive: updatedVisitor.customerExecutive,
 customerExecutiveName: updatedVisitor.customerExecutiveName,
 comments: updatedVisitor.comments,
 amount: updatedVisitor.amount,
 pipelineHistory: updatedVisitor.pipelineHistory,
 lastModifiedBy: updatedVisitor.lastModifiedBy,
 lastModifiedAt: updatedVisitor.lastModifiedAt,
 convertedBy: updatedVisitor.convertedBy,
 convertedAt: updatedVisitor.convertedAt
 });

 } catch (error) {
 console.error('❌ Update visitor status API error:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to update visitor status',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500 });
 }
}

export const PUT = async (request: NextRequest) => {
 try {
 console.log('📥 PUT request received for update-visitor-status');
 
 // Get user info from request headers (sent by frontend)
 const userHeader = request.headers.get('X-User-Info');
 console.log('📋 X-User-Info header:', userHeader);
 
 let user: any = { userId: 'temp', username: 'admin', name: 'Admin', role: 'admin' };
 
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
 
 console.log('✅ Using user for status update:', JSON.stringify(user, null, 2));
 return await updateVisitorStatus(request, user);
 } catch (error) {
 console.error('Update visitor status API error:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to update visitor status'
 }, { status: 500 });
 }
};

