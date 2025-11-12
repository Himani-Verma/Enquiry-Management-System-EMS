/**
 * GET /api/catalog/parameters
 * Fetch test parameters from TestCatalog with search and filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import TestCatalog from '@/lib/models/TestCatalog';
import { corsHeaders } from '@/lib/cors';

/**
 * Valid category enum values (same as upload route)
 */
const VALID_CATEGORIES = [
 'Water Testing',
 'Food Testing',
 'Environmental Testing',
 'Others'
] as const;

/**
 * Handle CORS preflight
 */
export async function OPTIONS() {
 return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/catalog/parameters
 * Query params:
 * - service (required): Service name (e.g., "Food Testing")
 * - q (optional): Search string for testName/method
 * - group (optional): Exact match on normalized group
 * - limit (optional, default 50, max 200): Number of items per page
 * - page (optional, default 1): Page number
 */
export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url);
 
 // Get query parameters
 const service = searchParams.get('service')?.trim();
 const q = searchParams.get('q')?.trim();
 const group = searchParams.get('group')?.trim();
 const limitParam = searchParams.get('limit');
 const pageParam = searchParams.get('page');
 
 // Validate required service parameter
 if (!service) {
 return NextResponse.json({
 success: false,
 message: 'service parameter is required'
 }, { status: 400, headers: corsHeaders });
 }
 
 // Validate service is in allowed categories
 const isValidService = VALID_CATEGORIES.some(
 valid => valid.toLowerCase() === service.toLowerCase()
 );
 
 if (!isValidService) {
 const validList = VALID_CATEGORIES.join(' | ');
 return NextResponse.json({
 success: false,
 message: `service must be one of: ${validList}`
 }, { status: 400, headers: corsHeaders });
 }
 
 // Normalize service name
 let normalizedService = service;
 if (service.toLowerCase() === 'environment testing') {
 normalizedService = 'Environmental Testing';
 } else {
 const exactMatch = VALID_CATEGORIES.find(
 valid => valid.toLowerCase() === service.toLowerCase()
 );
 normalizedService = exactMatch || service;
 }
 
 // Parse pagination parameters
 const limit = Math.min(Math.max(parseInt(limitParam || '50', 10), 1), 200);
 const page = Math.max(parseInt(pageParam || '1', 10), 1);
 const skip = (page - 1) * limit;
 
 await connectMongo();
 
 // Debug: Check if any documents exist for this service
 const serviceCount = await TestCatalog.countDocuments({ serviceName: normalizedService });
 console.log(`🔍 [Catalog API] Service: "${normalizedService}", Total docs: ${serviceCount}`);
 
 // Build query
 const query: any = { serviceName: normalizedService };
 
 // Add group filter if provided
 if (group) {
 query.group = group;
 }
 
 // Add search query
 let useTextSearch = false;
 if (q) {
 console.log(`🔍 [Catalog API] Search query: "${q}"`);
 // TestCatalog has a text index on { testName: 'text', method: 'text', group: 'text', printableText: 'text' }
 // Try to use text search if available, otherwise fallback to regex
 try {
 const indexes = await TestCatalog.collection.indexes();
 const hasTextIndex = indexes.some((idx: any) => idx.textIndexVersion || (idx.key && Object.values(idx.key).includes('text')));
 
 if (hasTextIndex) {
 // Use text search
 query.$text = { $search: q };
 useTextSearch = true;
 } else {
 // Fallback to case-insensitive regex search over multiple fields
 const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 const regex = new RegExp(escapedQ, 'i');
 query.$or = [
 { testName: regex },
 { printableText: regex },
 { method: regex },
 { group: regex }
 ];
 }
 } catch (error) {
 // Fallback to regex search if text index check fails
 const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 const regex = new RegExp(escapedQ, 'i');
 query.$or = [
 { testName: regex },
 { printableText: regex },
 { method: regex },
 { group: regex }
 ];
 }
 }
 
 // Build projection (exclude sensitive fields)
 const projection: any = {
 _id: 1,
 serviceId: 1,
 serviceName: 1,
 group: 1,
 testName: 1,
 printableText: 1,
 method: 1,
 tatDays: 1,
 unit: 1,
 accreditationStatus: 1,
 department: 1
 // Explicitly exclude: fingerprint, source, subVertical, __v
 };
 
 // Build sort
 let sort: any = { group: 1, testName: 1 };
 
 // For text search, add text score sorting
 if (useTextSearch) {
 // Text search requires textScore projection and sorting
 projection.score = { $meta: 'textScore' };
 sort = { score: { $meta: 'textScore' }, ...sort };
 }
 
 // Build count query (without text score)
 const countQuery: any = { serviceName: normalizedService };
 if (group) {
 countQuery.group = group;
 }
 if (q && !useTextSearch && query.$or) {
 countQuery.$or = query.$or;
 } else if (q && useTextSearch) {
 countQuery.$text = query.$text;
 }
 
 // Execute query with pagination
 console.log(`🔍 [Catalog API] Query:`, JSON.stringify(query, null, 2));
 const [items, total] = await Promise.all([
 TestCatalog.find(query, projection)
 .sort(sort)
 .skip(skip)
 .limit(limit)
 .lean()
 .exec(),
 TestCatalog.countDocuments(countQuery).exec()
 ]);
 
 console.log(`🔍 [Catalog API] Found ${items.length} items (total: ${total})`);
 
 // Calculate total pages
 const pages = Math.ceil(total / limit);
 
 // Format response items (remove any MongoDB metadata)
 const formattedItems = items.map((item: any) => {
 const { _id, serviceId, serviceName, group, testName, printableText, method, unit, tatDays, accreditationStatus, department } = item;
 return {
 _id: _id.toString(),
 serviceId: serviceId?.toString() || null,
 serviceName: serviceName || null,
 group: group || null,
 testName,
 printableText: printableText || null,
 method: method || null,
 unit: unit || null,
 tatDays: tatDays || null,
 accreditationStatus: accreditationStatus || null,
 department: department || null
 };
 });
 
 const response = {
 success: true,
 items: formattedItems,
 total,
 page,
 pages,
 limit
 };
 
 console.log(`✅ [Catalog API] Returning ${formattedItems.length} items`);
 return NextResponse.json(response, { headers: corsHeaders });
 
 } catch (error) {
 console.error('❌ [Catalog API] Error fetching catalog parameters:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to fetch catalog parameters',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500, headers: corsHeaders });
 }
}

