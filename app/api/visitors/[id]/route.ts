import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Visitor from '@/lib/models/Visitor';

export async function GET(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 console.log('📄 GET /api/visitors/[id] - Fetching visitor:', params.id);
 
 await connectMongo();
 
 const visitor: any = await Visitor.findById(params.id).lean();
 
 if (!visitor) {
 return NextResponse.json({
 success: false,
 message: 'Visitor not found'
 }, { status: 404 });
 }
 
 console.log('✅ Visitor found:', visitor.name);
 
 return NextResponse.json({
 success: true,
 visitor
 });
 
 } catch (error: any) {
 console.error('❌ Error fetching visitor:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to fetch visitor',
 error: error.message
 }, { status: 500 });
 }
}

export async function DELETE(
 request: NextRequest,
 { params }: { params: { id: string } }
) {
 try {
 console.log('🗑️ DELETE /api/visitors/[id] - Deleting visitor:', params.id);
 
 await connectMongo();
 
 const visitor = await Visitor.findByIdAndDelete(params.id);
 
 if (!visitor) {
 return NextResponse.json({
 success: false,
 message: 'Visitor not found'
 }, { status: 404 });
 }
 
 console.log('✅ Visitor deleted successfully:', visitor.name);
 
 return NextResponse.json({
 success: true,
 message: 'Visitor deleted successfully',
 deletedVisitor: {
 _id: visitor._id.toString(),
 name: visitor.name,
 email: visitor.email,
 phone: visitor.phone
 }
 });
 
 } catch (error: any) {
 console.error('❌ Error deleting visitor:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to delete visitor',
 error: error.message
 }, { status: 500 });
 }
}
