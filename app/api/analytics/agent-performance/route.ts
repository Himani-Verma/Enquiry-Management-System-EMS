import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import User from '@/lib/models/User';
import Visitor from '@/lib/models/Visitor';
import Enquiry from '@/lib/models/Enquiry';
import mongoose from 'mongoose';

// Temporarily disable authentication for testing
export const GET = async (request: NextRequest) => {
 try {
 console.log('🔄 GET /api/analytics/agent-performance - Fetching REAL agent performance data from DB');
 
 await connectMongo();
 console.log('✅ Connected to MongoDB');

 // Fetch all executives/agents - include all agent roles
 const agents = await User.find({ 
 role: { $in: ['executive', 'sales-executive', 'customer-executive'] }
 }).select('-password').lean();
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
 
 // Count enquiries added by this agent
 const enquiriesAdded = await Enquiry.countDocuments({
 addedBy: new mongoose.Types.ObjectId(agentId)
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

 // If no agents found, return sample data for demonstration
 if (agentPerformance.length === 0) {
 console.log('⚠️ No agents found, returning sample performance data');
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
