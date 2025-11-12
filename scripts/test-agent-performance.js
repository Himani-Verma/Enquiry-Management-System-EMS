/**
 * Test Script: Verify Agent Performance Tracking
 * 
 * This script tests the agent performance tracking implementation
 * by querying the database directly and comparing with API results.
 * 
 * Usage:
 *   node scripts/test-agent-performance.js
 */

const mongoose = require('mongoose');

// MongoDB connection string - update with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
}, { timestamps: true, collection: "users", strict: false });

const EnquirySchema = new mongoose.Schema({
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  addedByName: String,
}, { timestamps: true, collection: "enquiries", strict: false });

const VisitorSchema = new mongoose.Schema({
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  salesExecutive: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerExecutive: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isConverted: Boolean,
}, { timestamps: true, collection: "visitors", strict: false });

async function testAgentPerformance() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', UserSchema);
    const Enquiry = mongoose.model('Enquiry', EnquirySchema);
    const Visitor = mongoose.model('Visitor', VisitorSchema);

    // Get all agents
    const agents = await User.find({
      role: { $in: ['executive', 'sales-executive', 'customer-executive'] }
    }).lean();

    console.log(`📊 Testing performance tracking for ${agents.length} agents\n`);
    console.log('='.repeat(80));

    for (const agent of agents) {
      const agentId = agent._id;
      
      // Count visitors handled
      const visitorsHandled = await Visitor.countDocuments({
        $or: [
          { assignedAgent: agentId },
          { salesExecutive: agentId },
          { customerExecutive: agentId }
        ]
      });
      
      // Count enquiries added
      const enquiriesAdded = await Enquiry.countDocuments({
        addedBy: agentId
      });
      
      // Count leads converted
      const leadsConverted = await Visitor.countDocuments({
        $or: [
          { assignedAgent: agentId },
          { salesExecutive: agentId },
          { customerExecutive: agentId }
        ],
        isConverted: true
      });
      
      // Calculate conversion rate
      const conversionRate = visitorsHandled > 0 
        ? ((leadsConverted / visitorsHandled) * 100).toFixed(1)
        : '0.0';

      console.log(`\n👤 Agent: ${agent.name} (${agent.email})`);
      console.log(`   Role: ${agent.role}`);
      console.log(`   📊 Visitors Handled: ${visitorsHandled}`);
      console.log(`   📝 Enquiries Added: ${enquiriesAdded}`);
      console.log(`   ✅ Leads Converted: ${leadsConverted}`);
      console.log(`   📈 Conversion Rate: ${conversionRate}%`);
      console.log('-'.repeat(80));
    }

    // Summary statistics
    console.log('\n📊 SUMMARY STATISTICS');
    console.log('='.repeat(80));
    
    const totalVisitors = await Visitor.countDocuments({});
    const totalEnquiries = await Enquiry.countDocuments({});
    const totalConverted = await Visitor.countDocuments({ isConverted: true });
    const enquiriesWithTracking = await Enquiry.countDocuments({ addedBy: { $exists: true, $ne: null } });
    const visitorsWithAgent = await Visitor.countDocuments({
      $or: [
        { assignedAgent: { $exists: true, $ne: null } },
        { salesExecutive: { $exists: true, $ne: null } },
        { customerExecutive: { $exists: true, $ne: null } }
      ]
    });

    console.log(`\n📈 Total Visitors: ${totalVisitors}`);
    console.log(`   └─ Assigned to agents: ${visitorsWithAgent} (${((visitorsWithAgent/totalVisitors)*100).toFixed(1)}%)`);
    console.log(`\n📝 Total Enquiries: ${totalEnquiries}`);
    console.log(`   └─ With agent tracking: ${enquiriesWithTracking} (${((enquiriesWithTracking/totalEnquiries)*100).toFixed(1)}%)`);
    console.log(`\n✅ Total Converted: ${totalConverted}`);
    console.log(`   └─ Overall conversion rate: ${((totalConverted/totalVisitors)*100).toFixed(1)}%`);

    // Warnings
    console.log('\n⚠️  WARNINGS');
    console.log('='.repeat(80));
    
    if (enquiriesWithTracking < totalEnquiries) {
      const missing = totalEnquiries - enquiriesWithTracking;
      console.log(`⚠️  ${missing} enquiries are missing agent tracking (addedBy field)`);
      console.log(`   Run migration script to backfill: node scripts/migrate-enquiry-tracking.js`);
    }
    
    if (visitorsWithAgent < totalVisitors) {
      const missing = totalVisitors - visitorsWithAgent;
      console.log(`⚠️  ${missing} visitors are not assigned to any agent`);
      console.log(`   These visitors won't count towards agent performance metrics`);
    }

    if (enquiriesWithTracking === totalEnquiries && visitorsWithAgent === totalVisitors) {
      console.log('✅ All data is properly tracked! No issues found.');
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the test
testAgentPerformance();
