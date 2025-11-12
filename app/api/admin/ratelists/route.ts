import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import RateList from '@/lib/models/RateList';
import Service from '@/lib/models/Service';
import { corsHeaders } from '@/lib/cors';

// Verify admin authentication
async function verifyAdmin(request: NextRequest): Promise<boolean> {
 // TODO: Add actual JWT verification
 // For now, return true
 return true;
}

// Handle CORS preflight
export async function OPTIONS() {
 return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/admin/ratelists - List all rate lists
export async function GET(request: NextRequest) {
 try {
 console.log('🔄 GET /api/admin/ratelists - Fetching rate lists');
 
 // Verify admin
 if (!(await verifyAdmin(request))) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 403, headers: corsHeaders });
 }

 await connectMongo();
 console.log('✅ Connected to MongoDB');

 // Get query parameters
 const { searchParams } = new URL(request.url);
 const page = parseInt(searchParams.get('page') || '1');
 const limit = parseInt(searchParams.get('limit') || '10');
 const category = searchParams.get('category');
 const serviceId = searchParams.get('service_id');
 const isActive = searchParams.get('isActive');

 // Build query
 const query: any = {};
 if (category) query.category = new RegExp(category, 'i');
 if (serviceId) query.service_id = serviceId;
 if (isActive !== null) query.isActive = isActive === 'true';

 // Pagination
 const skip = (page - 1) * limit;
 const total = await RateList.countDocuments(query);

 // Fetch rate lists with populated service
 const rateLists = await RateList.find(query)
 .populate('service_id', 'name')
 .sort({ lastUpdated: -1 })
 .skip(skip)
 .limit(limit)
 .lean();

 console.log(`✅ Found ${rateLists.length} rate lists`);

 return NextResponse.json({
 success: true,
 rateLists: rateLists.map(rl => ({
 _id: rl._id.toString(),
 category: rl.category,
 service_name: rl.service_id?.name || 'Unknown',
 service_id: rl.service_id?.toString(),
 testsCount: rl.tests.length,
 versionsCount: rl.versions?.length || 0,
 currentVersion: rl.currentVersion || 1,
 isActive: rl.isActive,
 lastUpdated: rl.lastUpdated,
 createdAt: rl.createdAt
 })),
 pagination: {
 page,
 limit,
 total,
 totalPages: Math.ceil(total / limit),
 hasNext: page < Math.ceil(total / limit),
 hasPrev: page > 1
 }
 }, { headers: corsHeaders });

 } catch (error) {
 console.error('❌ Admin rate lists API error:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to fetch rate lists',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500, headers: corsHeaders });
 }
}

// POST /api/admin/ratelists - Create new rate list
export async function POST(request: NextRequest) {
 try {
 console.log('🔄 POST /api/admin/ratelists - Creating rate list');
 
 // Verify admin
 if (!(await verifyAdmin(request))) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 403, headers: corsHeaders });
 }

 await connectMongo();
 console.log('✅ Connected to MongoDB');

 const body = await request.json();
 const { category, service_id, tests, notes, createdBy } = body;

 // Validation
 if (!category || !service_id || !Array.isArray(tests)) {
 return NextResponse.json({
 success: false,
 message: 'Category, service_id, and tests are required'
 }, { status: 400, headers: corsHeaders });
 }

 // Validate service exists
 const service = await Service.findById(service_id);
 if (!service) {
 return NextResponse.json({
 success: false,
 message: 'Invalid service_id'
 }, { status: 400, headers: corsHeaders });
 }

 // Check if exists
 const existingRateList = await RateList.findOne({ category: category.trim() });
 if (existingRateList) {
 return NextResponse.json({
 success: false,
 message: 'Rate list with this category already exists'
 }, { status: 409, headers: corsHeaders });
 }

 // Create initial version
 const initialVersion = {
 versionNumber: 1,
 tests: tests,
 notes: notes || 'Initial version',
 createdBy: createdBy || 'Admin',
 createdAt: new Date()
 };

 // Create rate list
 const rateList = new RateList({
 category: category.trim(),
 service_id: service_id,
 tests: tests,
 versions: [initialVersion],
 currentVersion: 1,
 isActive: true,
 lastUpdated: new Date()
 });

 await rateList.save();
 console.log(`✅ Created rate list: ${category}`);

 return NextResponse.json({
 success: true,
 message: 'Rate list created successfully',
 rateList: {
 _id: rateList._id.toString(),
 category: rateList.category,
 service_name: service.name,
 service_id: rateList.service_id.toString(),
 testsCount: rateList.tests.length,
 versionsCount: rateList.versions.length,
 currentVersion: rateList.currentVersion,
 lastUpdated: rateList.lastUpdated
 }
 }, { headers: corsHeaders });

 } catch (error) {
 console.error('❌ Create rate list error:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to create rate list',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500, headers: corsHeaders });
 }
}

