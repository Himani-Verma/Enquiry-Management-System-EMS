import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Visitor from '@/lib/models/Visitor';
import { corsHeaders } from '@/lib/cors';

export const dynamic = 'force-dynamic';

// GET - Fetch visitors with filtering and pagination
export async function GET(request: NextRequest) {
 try {
 console.log('🔄 GET /api/visitors - Fetching visitors');
 
 const { searchParams } = new URL(request.url);
 const page = parseInt(searchParams.get('page') || '1');
 const limit = parseInt(searchParams.get('limit') || '1000');
 const search = searchParams.get('search') || '';
 const status = searchParams.get('status') || '';
 const source = searchParams.get('source') || '';
 
 console.log('📊 Visitors API params:', { page, limit, search, status, source });
 
 await connectMongo();
 console.log('✅ Connected to MongoDB');
 
 // Build filter
 const filter: any = {};
 
 if (search) {
 filter.$or = [
 { name: { $regex: search, $options: 'i' } },
 { email: { $regex: search, $options: 'i' } },
 { organization: { $regex: search, $options: 'i' } }
 ];
 }
 
 if (status) {
 filter.status = status;
 }
 
 if (source) {
 filter.source = source;
 }
 
 // Count total
 const total = await Visitor.countDocuments(filter);
 
 // Fetch visitors
 const visitors = await Visitor.find(filter)
 .sort({ createdAt: -1 })
 .skip((page - 1) * limit)
 .limit(limit)
 .lean();
 
 console.log(`📊 Found ${visitors.length} visitors (page ${page}/${Math.ceil(total / limit)})`);
 
 return NextResponse.json({
 success: true,
 visitors,
 total,
 count: visitors.length,
 items: visitors,
 pagination: {
 page,
 limit,
 total,
 totalPages: Math.ceil(total / limit)
 }
 }, { headers: corsHeaders });
 
 } catch (error: any) {
 console.error('❌ Error fetching visitors:', error);
 // Graceful fallback so UI doesn't break when DB is unavailable
 return NextResponse.json({
 success: true,
 visitors: [],
 items: [],
 total: 0,
 count: 0,
 pagination: {
 page: 1,
 limit: 0,
 total: 0,
 totalPages: 0
 },
 message: 'Fallback data - visitors unavailable'
 }, { status: 200, headers: corsHeaders });
 }
}

// POST - Create new visitor
export async function POST(request: NextRequest) {
 try {
 console.log('📝 POST /api/visitors - Creating new visitor');
 
 const body = await request.json();
 
 // Validate required fields
 if (!body.name || !body.email) {
 return NextResponse.json({
 success: false,
 error: 'Name and email are required'
 }, { status: 400, headers: corsHeaders });
 }
 
 await connectMongo();
 
 // Create new visitor with provided data
 const newVisitor = new Visitor({
 ...body,
 // Set timestamps from body if provided, otherwise use current time
 createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
 updatedAt: body.updatedAt ? new Date(body.updatedAt) : new Date(),
 lastInteractionAt: body.lastInteractionAt ? new Date(body.lastInteractionAt) : new Date()
 });
 
 await newVisitor.save();
 
 console.log('✅ Visitor created:', newVisitor.name);
 
 return NextResponse.json({
 success: true,
 visitor: newVisitor
 }, { headers: corsHeaders });
 
 } catch (error: any) {
 console.error('❌ Error creating visitor:', error);
 return NextResponse.json({
 success: false,
 error: 'Failed to create visitor',
 message: error.message
 }, { status: 500, headers: corsHeaders });
 }
}

// PUT - Update visitor
export async function PUT(request: NextRequest) {
 try {
 console.log('✏️ PUT /api/visitors - Updating visitor');
 
 const body = await request.json();
 const { visitorId, ...updateData } = body;
 
 if (!visitorId) {
 return NextResponse.json({
 success: false,
 error: 'Visitor ID is required'
 }, { status: 400, headers: corsHeaders });
 }
 
 await connectMongo();
 
 const updatedVisitor = await Visitor.findByIdAndUpdate(
 visitorId,
 { ...updateData, updatedAt: new Date() },
 { new: true, runValidators: true }
 );
 
 if (!updatedVisitor) {
 return NextResponse.json({
 success: false,
 error: 'Visitor not found'
 }, { status: 404, headers: corsHeaders });
 }
 
 console.log('✅ Visitor updated:', updatedVisitor.name);
 
 return NextResponse.json({
 success: true,
 visitor: updatedVisitor
 }, { headers: corsHeaders });
 
 } catch (error: any) {
 console.error('❌ Error updating visitor:', error);
 return NextResponse.json({
 success: false,
 error: 'Failed to update visitor',
 message: error.message
 }, { status: 500, headers: corsHeaders });
 }
}

// DELETE - Delete visitor
export async function DELETE(request: NextRequest) {
 try {
 console.log('🗑️ DELETE /api/visitors - Deleting visitor');
 
 const { searchParams } = new URL(request.url);
 const visitorId = searchParams.get('id');
 const idsParam = searchParams.get('ids'); // support multiple ids (comma-separated)
 const deleteAll = searchParams.get('deleteAll') === 'true';
 
 if (deleteAll) {
 await connectMongo();
 const result = await Visitor.deleteMany({});
 return NextResponse.json({
 success: true,
 message: `Deleted ${result.deletedCount} visitors`
 }, { headers: corsHeaders });
 }

 // Delete multiple if ids provided
 if (idsParam) {
 await connectMongo();
 const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
 const result = await Visitor.deleteMany({ _id: { $in: ids } });
 return NextResponse.json({
 success: true,
 message: `Deleted ${result.deletedCount} visitor(s)`
 }, { headers: corsHeaders });
 }

 if (!visitorId) {
 return NextResponse.json({
 success: false,
 error: 'Visitor ID is required'
 }, { status: 400, headers: corsHeaders });
 }
 
 await connectMongo();
 
 const deletedVisitor = await Visitor.findByIdAndDelete(visitorId);
 
 if (!deletedVisitor) {
 return NextResponse.json({
 success: false,
 error: 'Visitor not found'
 }, { status: 404, headers: corsHeaders });
 }
 
 console.log('✅ Visitor deleted:', deletedVisitor.name);
 
 return NextResponse.json({
 success: true,
 message: 'Visitor deleted successfully'
 }, { headers: corsHeaders });
 
 } catch (error: any) {
 console.error('❌ Error deleting visitor:', error);
 return NextResponse.json({
 success: false,
 error: 'Failed to delete visitor',
 message: error.message
 }, { status: 500, headers: corsHeaders });
 }
}
