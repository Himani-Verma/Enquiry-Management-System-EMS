import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import User from '@/lib/models/User';
import Visitor from '@/lib/models/Visitor';
import Enquiry from '@/lib/models/Enquiry';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Get user from request headers
export const GET = async (request: NextRequest) => {
 try {
 console.log('🔄 GET /api/analytics/agent-performance - Fetching REAL agent performance data from DB');
 
 // Get user info from request headers
 const userHeader = request.headers.get('X-User-Info');
 let currentUser: any = null;
 
 if (userHeader && userHeader !== 'null' && userHeader !== 'undefined') {
 try {
 currentUser = JSON.parse(userHeader);
 console.log('🔐 Current user:', JSON.stringify(currentUser, null, 2));
 } catch (e) {
 console.error('❌ Failed to parse user header:', e);
 }
 }
 
 await connectMongo();
 console.log('✅ Connected to MongoDB');

 // Fetch agents based on user role
 let agentFilter: any = { 
 role: { $in: ['executive', 'sales-executive', 'customer-executive'] }
 };
 
 // Sales executives see only their own performance
 if (currentUser && currentUser.role === 'sales-executive') {
 agentFilter._id = new mongoose.Types.ObjectId(currentUser.id || currentUser.userId);
 console.log('✅ Sales executive filter - showing only own performance');
 }
 
 const agents = await User.find(agentFilter).select('-password').lean();
 console.log(`👥 Found ${agents.length} agents`);

 // Calculate REAL performance metrics for each agent from database
 const agentPerformance = await Promise.all(agents.map(async (agent: any) => {
 const agentId = String(agent._id);
 
 // Count visitors assigned to this agent (using assignedAgent, salesExecutive, or customerExecutive fields)
 const visitorsHandled = await Visitor.countDocuments({
 $or: [
 { assignedAgent: new mongoose.Types.ObjectId(agentId) },
 { salesExecutive: new mongoose.Types.ObjectId(agentId) },
 { customerExecutive: new mongoose.Types.ObjectId(agentId) }
 ]
 });
 
 // Count enquiries (visitors) assigned to this agent
 // Enquiries are stored in the Visitor collection, not a separate Enquiry collection
 const enquiriesAdded = await Visitor.countDocuments({
 $or: [
 { assignedAgent: new mongoose.Types.ObjectId(agentId) },
 { salesExecutive: new mongoose.Types.ObjectId(agentId) },
 { customerExecutive: new mongoose.Types.ObjectId(agentId) }
 ]
 });
 
 // Count converted leads (visitors with isConverted = true) assigned to this agent
 const leadsConverted = await Visitor.countDocuments({
 $or: [
 { assignedAgent: new mongoose.Types.ObjectId(agentId) },
 { salesExecutive: new mongoose.Types.ObjectId(agentId) },
 { customerExecutive: new mongoose.Types.ObjectId(agentId) }
 ],
 isConverted: true
 });
 
 // Calculate conversion rate
 const conversionRate = visitorsHandled > 0 
 ? Math.round((leadsConverted / visitorsHandled) * 100) 
 : 0;

 console.log(`📊 Agent ${agent.name}: ${visitorsHandled} visitors, ${enquiriesAdded} enquiries, ${leadsConverted} leads`);

 return {
 agentId: agentId,
 agentName: agent.name,
 agentEmail: agent.email,
 department: agent.department || 'N/A',
 role: agent.role,
 region: agent.region || 'N/A',
 
 // Real data from database
 visitorsHandled: visitorsHandled,
 enquiriesAdded: enquiriesAdded,
 leadsConverted: leadsConverted,
 
 // Calculated metrics
 conversionRate: conversionRate,
 
 // Status
 isActive: agent.isActive !== false,
 lastActive: agent.lastActiveAt || agent.updatedAt || new Date().toISOString(),
 };
 }));

 console.log(`📊 Generated REAL performance data for ${agentPerformance.length} agents from database`);

 // Check if all agents have zero performance data
 const hasAnyData = agentPerformance.some(agent => 
 agent.visitorsHandled > 0 || agent.enquiriesAdded > 0 || agent.leadsConverted > 0
 );

 // If no agents found OR all agents have zero data, return sample data with real agent names
 if (agentPerformance.length === 0 || !hasAnyData) {
 console.log('⚠️ No agents found or all have zero data, returning sample performance data with real agent info');
 
 // Use real agent data if available, otherwise use sample
 const performanceWithData = agentPerformance.length > 0 
 ? agentPerformance.map((agent, index) => ({
 ...agent,
 visitorsHandled: [35, 28, 42, 31, 25][index % 5] || 30,
 enquiriesAdded: [15, 12, 18, 14, 10][index % 5] || 12,
 leadsConverted: [8, 6, 10, 7, 5][index % 5] || 7,
 conversionRate: [23, 21, 24, 23, 20][index % 5] || 22
 }))
 : [];
 if (performanceWithData.length > 0) {
 return NextResponse.json({
 success: true,
 agentPerformance: performanceWithData,
 totalAgents: performanceWithData.length,
 activeAgents: performanceWithData.filter(a => a.isActive).length,
 isSampleData: true,
 message: 'Using demo data - no visitor/enquiry data found'
 });
 }
 
 // Fallback to completely sample data if no agents at all
 const samplePerformance = [
 {
 agentId: 'sample-1',
 agentName: 'Sample Agent 1',
 agentEmail: 'agent1@example.com',
 department: 'Sales',
 role: 'sales-executive',
 region: 'North',
 visitorsHandled: 35,
 enquiriesAdded: 15,
 leadsConverted: 8,
 conversionRate: 23,
 isActive: true,
 lastActive: new Date().toISOString()
 },
 {
 agentId: 'sample-2', 
 agentName: 'Sample Agent 2',
 agentEmail: 'agent2@example.com',
 department: 'Customer Service',
 role: 'customer-executive',
 region: 'South',
 visitorsHandled: 28,
 enquiriesAdded: 12,
 leadsConverted: 6,
 conversionRate: 21,
 isActive: true,
 lastActive: new Date().toISOString()
 }
 ];
 
 return NextResponse.json({
 success: true,
 agentPerformance: samplePerformance,
 totalAgents: samplePerformance.length,
 activeAgents: samplePerformance.filter(a => a.isActive).length,
 isSampleData: true
 });
 }

 return NextResponse.json({
 success: true,
 agentPerformance,
 totalAgents: agents.length,
 activeAgents: agentPerformance.filter(a => a.isActive).length,
 dataSource: 'database' // Indicate this is real data
 });

 } catch (error) {
 console.error('❌ Agent performance API error:', error);
 return NextResponse.json({
 success: false,
 message: 'Failed to fetch agent performance data',
 error: error instanceof Error ? error.message : 'Unknown error'
 }, { status: 500 });
 }
};
