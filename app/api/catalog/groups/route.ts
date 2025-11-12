/**
 * GET /api/catalog/groups
 * Fetch distinct groups from TestCatalog for a service
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
 * GET /api/catalog/groups
 * Query params:
 * - service (required): Service name (e.g., "Food Testing")
 * 
 * Returns distinct normalized groups for the service, sorted A→Z
 */
export async function GET(request: NextRequest) {
 try {
 const { searchParams } = new URL(request.url);
 
 // Get query parameters
 const service = searchParams.get('service')?.trim();
 
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
 
 await connectMongo();
 
 // Get distinct groups for the service
 // Filter out null and empty strings, sort A→Z
 const groups = await TestCatalog.distinct('group', {
 serviceName: normalizedService
 });
 
 // Filter out null, undefined, and empty strings, then sort
 const filteredGroups = groups
 .filter((g: any) => g != null && String(g).trim() !== '')
 .map((g: any) => String(g).trim())
 .sort((a: string, b: string) => a.localeCompare(b));
 
 return NextResponse.json({
 success: true,
 groups: filteredGroups
 }, { headers: corsHeaders });
 
 } catch (error) {
 console.error('❌ Error fetching catalog groups:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to fetch catalog groups',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500, headers: corsHeaders });
 }
}

