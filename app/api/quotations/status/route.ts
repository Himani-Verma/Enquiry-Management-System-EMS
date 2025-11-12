import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Quotation from '@/lib/models/Quotation';
import { corsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

// POST - Update quotation status
export async function POST(request: NextRequest) {
 try {
 console.log('🔄 POST /api/quotations/status - Updating quotation status');
 
 const body = await request.json();
 const {
 quotationId,
 status,
 userId,
 userName,
 reason
 } = body;
 
 if (!quotationId || !status || !userId || !userName) {
 return NextResponse.json({
 success: false,
 error: 'Missing required fields'
 }, { status: 400, headers: corsHeaders });
 }
 
 await connectMongo();
 
 const updateData: any = {
 status,
 lastModifiedBy: userName
 };
 
 // Handle status-specific updates
 if (status === 'approved') {
 updateData.approvedBy = userId;
 updateData.approvedByName = userName;
 updateData.approvedAt = new Date();
 } else if (status === 'rejected') {
 updateData.rejectedBy = userId;
 updateData.rejectedByName = userName;
 updateData.rejectedAt = new Date();
 if (reason) {
 updateData.rejectionReason = reason;
 }
 } else if (status === 'sent') {
 updateData.sentAt = new Date();
 }
 
 const updatedQuotation = await Quotation.findByIdAndUpdate(
 quotationId,
 {
 ...updateData,
 $push: {
 revisionHistory: {
 revisedAt: new Date(),
 revisedBy: userName,
 changes: `Status changed to ${status}`
 }
 }
 },
 { new: true }
 );
 
 if (!updatedQuotation) {
 return NextResponse.json({
 success: false,
 error: 'Quotation not found'
 }, { status: 404, headers: corsHeaders });
 }
 
 console.log(`✅ Quotation status updated to ${status}:`, updatedQuotation.quotationNo);
 
 return NextResponse.json({
 success: true,
 quotation: updatedQuotation
 }, { headers: corsHeaders });
 
 } catch (error: any) {
 console.error('❌ Error updating quotation status:', error);
 return NextResponse.json({
 success: false,
 error: 'Failed to update quotation status',
 message: error.message
 }, { status: 500, headers: corsHeaders });
 }
}

