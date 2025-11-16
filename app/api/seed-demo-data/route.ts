import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongo';
import Visitor from '@/lib/models/Visitor';
import Enquiry from '@/lib/models/Enquiry';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('🌱 Seeding demo data...');
    await connectMongo();

    // Get existing agents
    const agents = await User.find({ role: { $in: ['sales-executive', 'customer-executive'] } }).limit(3);
    
    if (agents.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No agents found. Please create some users first.'
      }, { status: 400 });
    }

    // Clear existing demo data (optional - comment out if you want to keep existing data)
    // await Visitor.deleteMany({});
    // await Enquiry.deleteMany({});

    // Create demo visitors
    const demoVisitors = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@example.com',
        phone: '+91 98765 43210',
        organization: 'Tech Solutions Pvt Ltd',
        region: 'Mumbai',
        service: 'Water Testing',
        source: 'chatbot',
        status: 'new',
        assignedAgent: agents[0]?._id,
        agentName: agents[0]?.name,
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 98765 43211',
        organization: 'Green Industries',
        region: 'Delhi',
        service: 'Air Quality Testing',
        source: 'website',
        status: 'contacted',
        assignedAgent: agents[1]?._id,
        agentName: agents[1]?.name,
      },
      {
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        phone: '+91 98765 43212',
        organization: 'Food Corp',
        region: 'Bangalore',
        service: 'Food Testing',
        source: 'chatbot',
        status: 'qualified',
        assignedAgent: agents[0]?._id,
        agentName: agents[0]?.name,
        isConverted: true,
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        phone: '+91 98765 43213',
        organization: 'Pharma Labs',
        region: 'Hyderabad',
        service: 'Pharmaceutical Testing',
        source: 'email',
        status: 'proposal_sent',
        assignedAgent: agents[2]?._id,
        agentName: agents[2]?.name,
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@example.com',
        phone: '+91 98765 43214',
        organization: 'Construction Co',
        region: 'Pune',
        service: 'Soil Testing',
        source: 'chatbot',
        status: 'new',
        assignedAgent: agents[1]?._id,
        agentName: agents[1]?.name,
      },
      {
        name: 'Anita Desai',
        email: 'anita.desai@example.com',
        phone: '+91 98765 43215',
        organization: 'Textile Mills',
        region: 'Ahmedabad',
        service: 'Textile Testing',
        source: 'website',
        status: 'qualified',
        assignedAgent: agents[0]?._id,
        agentName: agents[0]?.name,
        isConverted: true,
      },
      {
        name: 'Rahul Mehta',
        email: 'rahul.mehta@example.com',
        phone: '+91 98765 43216',
        organization: 'Agro Industries',
        region: 'Chennai',
        service: 'Agricultural Testing',
        source: 'chatbot',
        status: 'contacted',
        assignedAgent: agents[2]?._id,
        agentName: agents[2]?.name,
      },
      {
        name: 'Kavita Joshi',
        email: 'kavita.joshi@example.com',
        phone: '+91 98765 43217',
        organization: 'Chemical Corp',
        region: 'Kolkata',
        service: 'Chemical Analysis',
        source: 'email',
        status: 'proposal_sent',
        assignedAgent: agents[1]?._id,
        agentName: agents[1]?.name,
      },
      {
        name: 'Suresh Nair',
        email: 'suresh.nair@example.com',
        phone: '+91 98765 43218',
        organization: 'Marine Services',
        region: 'Kochi',
        service: 'Marine Water Testing',
        source: 'chatbot',
        status: 'qualified',
        assignedAgent: agents[0]?._id,
        agentName: agents[0]?.name,
        isConverted: true,
      },
      {
        name: 'Deepa Iyer',
        email: 'deepa.iyer@example.com',
        phone: '+91 98765 43219',
        organization: 'Cosmetics Ltd',
        region: 'Mumbai',
        service: 'Cosmetic Testing',
        source: 'website',
        status: 'new',
        assignedAgent: agents[2]?._id,
        agentName: agents[2]?.name,
      },
    ];

    // Insert visitors
    const createdVisitors = await Visitor.insertMany(demoVisitors);
    console.log(`✅ Created ${createdVisitors.length} demo visitors`);

    // Create some demo enquiries
    const demoEnquiries = [
      {
        visitorId: createdVisitors[2]._id,
        name: 'Amit Patel',
        email: 'amit.patel@example.com',
        phone: '+91 98765 43212',
        service: 'Food Testing',
        status: 'converted',
        assignedTo: agents[0]?._id,
        isConverted: true,
      },
      {
        visitorId: createdVisitors[5]._id,
        name: 'Anita Desai',
        email: 'anita.desai@example.com',
        phone: '+91 98765 43215',
        service: 'Textile Testing',
        status: 'converted',
        assignedTo: agents[0]?._id,
        isConverted: true,
      },
      {
        visitorId: createdVisitors[8]._id,
        name: 'Suresh Nair',
        email: 'suresh.nair@example.com',
        phone: '+91 98765 43218',
        service: 'Marine Water Testing',
        status: 'converted',
        assignedTo: agents[0]?._id,
        isConverted: true,
      },
    ];

    const createdEnquiries = await Enquiry.insertMany(demoEnquiries);
    console.log(`✅ Created ${createdEnquiries.length} demo enquiries`);

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      data: {
        visitors: createdVisitors.length,
        enquiries: createdEnquiries.length,
      }
    });

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to seed demo data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
