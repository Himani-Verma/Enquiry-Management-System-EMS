import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { connectMongo } from '@/lib/mongo';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
 try {
 console.log('🔄 GET /api/auth/sales-executives - Fetching sales executives from database');
 
 await connectMongo();
 console.log('✅ Connected to MongoDB');
 
 // Fetch actual sales executives from database
 const salesExecutives = await User.find({ 
 role: 'sales-executive',
 isApproved: true // Only show approved users
 }).select('-password').lean();
 
 console.log(`✅ Found ${salesExecutives.length} sales executives in database`);
 
 // Transform data for frontend
 const transformedSalesExecutives = salesExecutives.map(se => ({
 _id: se._id.toString(),
 id: se._id.toString(),
 name: se.name || se.username,
 username: se.username,
 email: se.email,
 role: se.role,
 displayName: `${se.name || se.username} (Sales Executive)`
 }));

 const response = NextResponse.json({
 success: true,
 users: transformedSalesExecutives,
 salesExecutives: transformedSalesExecutives,
 count: transformedSalesExecutives.length,
 message: 'Sales executives fetched successfully from database'
 });
 
 // Add CORS headers
 Object.entries(corsHeaders).forEach(([key, value]) => {
 response.headers.set(key, value);
 });
 
 return response;

 } catch (error) {
 console.error('❌ Sales executives API error:', error);
 
 // Return empty array instead of fake data
 const response = NextResponse.json({
 success: true,
 users: [],
 salesExecutives: [],
 count: 0,
 message: 'No sales executives found or database error'
 });
 
 // Add CORS headers
 Object.entries(corsHeaders).forEach(([key, value]) => {
 response.headers.set(key, value);
 });
 
 return response;
 }
}