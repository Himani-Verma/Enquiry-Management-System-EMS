import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Service from '@/lib/models/Service';

// GET /api/executive-services/services - Get all available services from database
export async function GET(request: NextRequest) {
 try {
 console.log('🔄 GET /api/executive-services/services - Fetching services from database');
 
 await connectMongo();
 
 // Get all active services from database
 const services = await Service.find({ isActive: true })
 .select('name')
 .sort({ name: 1 })
 .lean();
 
 const serviceNames = services.map(s => s.name);
 console.log(`📊 Found ${serviceNames.length} services from database`);
 
 return NextResponse.json({ 
 services: serviceNames 
 }, {
 headers: {
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
 'Access-Control-Allow-Headers': 'Content-Type, Authorization',
 }
 });

 } catch (error) {
 console.error('❌ Services API error:', error);
 
 // Fallback to hardcoded services if database fails
 const fallbackServices = ['Food Testing', 'Water Testing', 'Environmental Testing', 'Others'];
 console.log('⚠️ Using fallback services');
 
 return NextResponse.json({ 
 services: fallbackServices 
 }, { status: 500 });
 }
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
 return new NextResponse(null, {
 status: 200,
 headers: {
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
 'Access-Control-Allow-Headers': 'Content-Type, Authorization',
 },
 });
}
