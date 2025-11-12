import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Visitor from '@/lib/models/Visitor';
import Enquiry from '@/lib/models/Enquiry';
import MemoryStorage from '@/lib/memoryStorage';

export async function POST(request: NextRequest) {
 try {
 console.log('🔄 POST /api/analytics/chatbot-enquiry - Creating enquiry from chatbot');
 
 const body = await request.json();
 console.log('📝 Request body:', body);

 const {
 name,
 email,
 phone,
 organization,
 service,
 subservice,
 enquiryDetails,
 location
 } = body;

 // Validate required fields
 if (!name || !enquiryDetails) {
 return NextResponse.json({
 success: false,
 message: 'Name and enquiry details are required'
 }, { status: 400 });
 }

 // Validate that either phone or email is provided
 if (!phone?.trim() && !email?.trim()) {
 return NextResponse.json({
 success: false,
 message: 'Either phone number or email address is required'
 }, { status: 400 });
 }

 // Try MongoDB connection, fallback to mock data if it fails
 let savedVisitor;
 try {
 await connectMongo();
 console.log('✅ Connected to MongoDB');

 // First, handle visitor data
 let visitor = null;
 
 // Check if visitor with same phone/email already exists
 if (phone?.trim()) {
 visitor = await Visitor.findOne({ phone: phone.trim() });
 }
 if (!visitor && email?.trim()) {
 visitor = await Visitor.findOne({ email: email.trim() });
 }

 if (!visitor) {
 // Create new visitor
 const visitorData = {
 name,
 email: email?.trim() || '',
 phone: phone?.trim() || '',
 organization: organization || '',
 service: service || 'General Inquiry',
 subservice: subservice || '',
 source: 'chatbot',
 location: location || '',
 meta: {},
 lastInteractionAt: new Date(),
 isConverted: false,
 status: 'enquiry_required',
 leadScore: 0,
 priority: 'medium',
 pipelineHistory: [],
 agentName: '',
 salesExecutiveName: ''
 };
 
 visitor = new Visitor(visitorData);
 await visitor.save();
 console.log('✅ New visitor created:', visitor._id);
 } else {
 // Update existing visitor - IMPORTANT: Update service field
 visitor.lastInteractionAt = new Date();
 if (service) {
 visitor.service = service;
 console.log(`✅ Updated visitor service to: ${service}`);
 }
 if (subservice) {
 visitor.subservice = subservice;
 }
 if (organization) {
 visitor.organization = organization;
 }
 if (location) {
 visitor.location = location;
 }
 await visitor.save();
 console.log('✅ Existing visitor updated with service:', visitor._id);
 }

 // Now create the enquiry record
 const enquiryData = {
 visitorId: visitor._id,
 visitorName: name,
 phoneNumber: phone?.trim() || '',
 email: email?.trim() || '',
 enquiryType: 'chatbot',
 enquiryDetails,
 status: 'new',
 priority: 'medium',
 assignedAgent: null,
 agentName: null,
 comments: '',
 amount: 0,
 service: service || 'General Inquiry',
 subservice: subservice || '',
 organization: organization || '',
 region: location || ''
 };

 const enquiry = new Enquiry(enquiryData);
 await enquiry.save();
 console.log('✅ New enquiry created:', enquiry._id);

 // Return visitor data for response
 savedVisitor = {
 _id: visitor._id,
 name: visitor.name,
 phone: visitor.phone,
 email: visitor.email,
 enquiryDetails,
 source: 'chatbot',
 status: 'enquiry_required',
 createdAt: visitor.createdAt,
 service: visitor.service || 'General Inquiry',
 subservice: visitor.subservice || '',
 organization: visitor.organization || '',
 region: visitor.location || '',
 agentName: visitor.agentName || '',
 salesExecutiveName: visitor.salesExecutiveName || '',
 comments: '',
 amount: 0
 };

 } catch (mongoError) {
 console.log('⚠️ MongoDB connection failed, using memory storage');
 console.error('MongoDB error:', mongoError);
 
 // Use memory storage as fallback
 const memoryStorage = MemoryStorage.getInstance();
 
 const enquiryData = {
 visitorName: name,
 email: email?.trim() || '',
 phoneNumber: phone?.trim() || '',
 enquiryType: 'chatbot',
 enquiryDetails,
 service: service || 'General Inquiry',
 subservice: subservice || '',
 organization: organization || '',
 region: location || '',
 status: 'new',
 priority: 'medium'
 };
 
 savedVisitor = memoryStorage.addEnquiry(enquiryData);
 console.log('✅ Enquiry saved to memory storage');
 }

 return NextResponse.json({
 success: true,
 message: 'Enquiry created successfully',
 visitor: savedVisitor
 });

 } catch (error) {
 console.error('❌ Error in chatbot-enquiry route:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to create enquiry',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500 });
 }
}
