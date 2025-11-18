import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Quotation from '@/lib/models/Quotation';
import { corsHeaders } from '@/lib/cors';
import { getUserContext } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

// GET - Fetch all quotations with filtering
export async function GET(request: NextRequest) {
 try {
 console.log('📄 GET /api/quotations - Fetching quotations');
 
 const { searchParams } = new URL(request.url);
 const page = parseInt(searchParams.get('page') || '1');
 const limit = parseInt(searchParams.get('limit') || '50');
 const search = searchParams.get('search') || '';
 const status = searchParams.get('status') || '';
 const userId = searchParams.get('userId') || '';
 const userRole = searchParams.get('userRole') || '';
 
 await connectMongo();
 
 // Get user info from request headers for role-based filtering
 const userHeader = request.headers.get('X-User-Info');
 let user: any = null;
 
 if (userHeader && userHeader !== 'null' && userHeader !== 'undefined') {
 try {
 user = JSON.parse(userHeader);
 } catch (e) {
 console.error('❌ Failed to parse user header:', e);
 }
 }
 
 // Build filter with role-based access
 const filter: any = {};
 
 // Apply role-based filtering for sales executives
 if (user && user.role === 'sales-executive') {
 // Sales executives see only quotations they created
 filter.createdBy = user.id || user.userId;
 console.log('✅ Applied sales executive filter - createdBy:', filter.createdBy);
 }
 
 // Search by quotation number or customer name
 if (search) {
 const searchFilter = {
 $or: [
 { quotationNo: { $regex: search, $options: 'i' } },
 { customerName: { $regex: search, $options: 'i' } },
 { contactPerson: { $regex: search, $options: 'i' } }
 ]
 };
 
 if (Object.keys(filter).length > 0) {
 filter.$and = [{ createdBy: filter.createdBy }, searchFilter];
 delete filter.createdBy;
 } else {
 Object.assign(filter, searchFilter);
 }
 }
 
 // Filter by status
 if (status) {
 if (filter.$and) {
 filter.$and.push({ status });
 } else if (Object.keys(filter).length > 0 && !filter.$or) {
 filter.$and = [{ createdBy: filter.createdBy }, { status }];
 delete filter.createdBy;
 } else {
 filter.status = status;
 }
 }
 
 // Count total documents
 const total = await Quotation.countDocuments(filter);
 
 // Fetch quotations with pagination
 const quotations = await Quotation.find(filter)
 .sort({ createdAt: -1 })
 .skip((page - 1) * limit)
 .limit(limit)
 .lean();
 
 console.log(`📊 Found ${quotations.length} quotations (page ${page}/${Math.ceil(total / limit)})`);
 
 return NextResponse.json({
 success: true,
 quotations,
 pagination: {
 page,
 limit,
 total,
 totalPages: Math.ceil(total / limit)
 }
 }, { headers: corsHeaders });
 
 } catch (error: any) {
 console.error('❌ Error fetching quotations:', error);
 return NextResponse.json({
 success: false,
 error: 'Failed to fetch quotations',
 message: error.message
 }, { status: 500, headers: corsHeaders });
 }
}

// POST - Create new quotation
export async function POST(request: NextRequest) {
 try {
 console.log('📝 POST /api/quotations - Creating new quotation');
 
 const body = await request.json();
 const {
 quotationData,
 userId,
 userName
 } = body;
 
 if (!quotationData || !userId || !userName) {
 return NextResponse.json({
 success: false,
 error: 'Missing required fields'
 }, { status: 400, headers: corsHeaders });
 }
 
 await connectMongo();
 
 // Create new quotation
 const newQuotation = new Quotation({
 ...quotationData,
 createdBy: userId,
 createdByName: userName,
 status: quotationData.status || 'draft'
 });
 

 
 await newQuotation.save();
 
 console.log('✅ Quotation created:', newQuotation.quotationNo);
 
 return NextResponse.json({
 success: true,
 quotation: newQuotation
 }, { headers: corsHeaders });
 
 } catch (error: any) {
 console.error('❌ Error creating quotation:', error);
 return NextResponse.json({
 success: false,
 error: 'Failed to create quotation',
 message: error.message
 }, { status: 500, headers: corsHeaders });
 }
}

// PUT - Update quotation
export async function PUT(request: NextRequest) {
 try {
 console.log('✏️ PUT /api/quotations - Updating quotation');
 
 const body = await request.json();
 const {
 quotationId,
 quotationData,
 userId,
 userName
 } = body;
 
 if (!quotationId || !quotationData) {
 return NextResponse.json({
 success: false,
 error: 'Missing required fields'
 }, { status: 400, headers: corsHeaders });
 }
 
 await connectMongo();
 
 // Find and update quotation
 const updatedQuotation = await Quotation.findByIdAndUpdate(
 quotationId,
 {
 ...quotationData,
 lastModifiedBy: userName,
 $push: {
 revisionHistory: {
 revisedAt: new Date(),
 revisedBy: userName,
 changes: 'Quotation updated'
 }
 }
 },
 { new: true, runValidators: true }
 );
 
 if (!updatedQuotation) {
 return NextResponse.json({
 success: false,
 error: 'Quotation not found'
 }, { status: 404, headers: corsHeaders });
 }
 
 console.log('✅ Quotation updated:', updatedQuotation.quotationNo);
 
 return NextResponse.json({
 success: true,
 quotation: updatedQuotation
 }, { headers: corsHeaders });
 
 } catch (error: any) {
 console.error('❌ Error updating quotation:', error);
 return NextResponse.json({
 success: false,
 error: 'Failed to update quotation',
 message: error.message
 }, { status: 500, headers: corsHeaders });
 }
}

// DELETE - Delete quotation
export async function DELETE(request: NextRequest) {
 try {
 console.log('🗑️ DELETE /api/quotations - Deleting quotation');
 
 const { searchParams } = new URL(request.url);
 const quotationId = searchParams.get('id');
 
 if (!quotationId) {
 return NextResponse.json({
 success: false,
 error: 'Quotation ID is required'
 }, { status: 400, headers: corsHeaders });
 }
 
 await connectMongo();
 
 const deletedQuotation = await Quotation.findByIdAndDelete(quotationId);
 
 if (!deletedQuotation) {
 return NextResponse.json({
 success: false,
 error: 'Quotation not found'
 }, { status: 404, headers: corsHeaders });
 }
 
 console.log('✅ Quotation deleted:', deletedQuotation.quotationNo);
 
 return NextResponse.json({
 success: true,
 message: 'Quotation deleted successfully'
 }, { headers: corsHeaders });
 
 } catch (error: any) {
 console.error('❌ Error deleting quotation:', error);
 return NextResponse.json({
 success: false,
 error: 'Failed to delete quotation',
 message: error.message
 }, { status: 500, headers: corsHeaders });
 }
}

