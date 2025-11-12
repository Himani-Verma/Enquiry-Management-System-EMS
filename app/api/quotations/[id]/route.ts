import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Quotation from '@/lib/models/Quotation';
import { corsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

// GET - Fetch single quotation by ID
export async function GET(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 console.log(`📄 GET /api/quotations/${params.id} - Fetching quotation`);
 
 await connectMongo();
 
 const quotation = await Quotation.findById(params.id)
 .populate('createdBy', 'name email')
 .populate('assignedTo', 'name email')
 .populate('approvedBy', 'name')
 .populate('rejectedBy', 'name')
 .lean();
 
 if (!quotation) {
 return NextResponse.json({
 success: false,
 error: 'Quotation not found'
 }, { status: 404, headers: corsHeaders });
 }
 
 console.log('✅ Quotation found:', quotation.quotationNo);
 
 return NextResponse.json({
 success: true,
 quotation
 }, { headers: corsHeaders });
 
 } catch (error: any) {
 console.error('❌ Error fetching quotation:', error);
 return NextResponse.json({
 success: false,
 error: 'Failed to fetch quotation',
 message: error.message
 }, { status: 500, headers: corsHeaders });
 }
}

