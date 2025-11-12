import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
 try {
 // Get token from Authorization header
 const authHeader = request.headers.get('authorization');
 if (!authHeader || !authHeader.startsWith('Bearer ')) {
 return NextResponse.json({
 success: false,
 message: 'No token provided'
 }, { status: 401 });
 }

 const token = authHeader.substring(7);
 
 // Verify token
 let decoded: any;
 try {
 decoded = jwt.verify(token, JWT_SECRET);
 } catch (err) {
 return NextResponse.json({
 success: false,
 message: 'Invalid token'
 }, { status: 401 });
 }

 await connectMongo();

 // Get user from database
 const user: any = await User.findById(decoded.userId).select('-password').lean();
 
 if (!user) {
 return NextResponse.json({
 success: false,
 message: 'User not found'
 }, { status: 404 });
 }

 return NextResponse.json({
 success: true,
 user: {
 id: String(user._id),
 _id: String(user._id),
 username: user.username,
 email: user.email,
 name: user.name,
 role: user.role,
 region: user.region,
 department: user.department,
 isActive: user.isActive,
 isApproved: user.isApproved
 }
 });

 } catch (error) {
 console.error('❌ Get current user error:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to get user info',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500 });
 }
}
