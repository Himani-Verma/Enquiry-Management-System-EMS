/**
 * Migration Script: Backfill Agent Tracking for Existing Enquiries
 * 
 * This script helps assign existing enquiries to agents based on visitor assignments.
 * Run this if you have existing enquiries without the addedBy field.
 * 
 * Usage:
 *   node scripts/migrate-enquiry-tracking.js
 */

const mongoose = require('mongoose');

// MongoDB connection string - update with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

const EnquirySchema = new mongoose.Schema({
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: "Visitor" },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  addedByName: String,
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  agentName: String,
}, { timestamps: true, collection: "enquiries", strict: false });

const VisitorSchema = new mongoose.Schema({
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  salesExecutive: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerExecutive: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  agentName: String,
  salesExecutiveName: String,
  customerExecutiveName: String,
}, { timestamps: true, collection: "visitors", strict: false });

async function migrateEnquiryTracking() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Enquiry = mongoose.model('Enquiry', EnquirySchema);
    const Visitor = mongoose.model('Visitor', VisitorSchema);

    // Find all enquiries without addedBy field
    const enquiriesWithoutTracking = await Enquiry.find({
      $or: [
        { addedBy: null },
        { addedBy: { $exists: false } }
      ]
    }).lean();

    console.log(`📊 Found ${enquiriesWithoutTracking.length} enquiries without agent tracking`);

    let updated = 0;
    let skipped = 0;

    for (const enquiry of enquiriesWithoutTracking) {
      // Try to find the associated visitor
      const visitor = await Visitor.findById(enquiry.visitorId).lean();
      
      if (!visitor) {
        console.log(`⚠️ Skipping enquiry ${enquiry._id} - visitor not found`);
        skipped++;
        continue;
      }

      // Determine which agent to assign based on visitor data
      let agentId = null;
      let agentName = null;

      // Priority: assignedAgent > salesExecutive > customerExecutive
      if (visitor.assignedAgent) {
        agentId = visitor.assignedAgent;
        agentName = visitor.agentName;
      } else if (visitor.salesExecutive) {
        agentId = visitor.salesExecutive;
        agentName = visitor.salesExecutiveName;
      } else if (visitor.customerExecutive) {
        agentId = visitor.customerExecutive;
        agentName = visitor.customerExecutiveName;
      }

      if (agentId) {
        // Update the enquiry with agent tracking
        await Enquiry.updateOne(
          { _id: enquiry._id },
          {
            $set: {
              addedBy: agentId,
              addedByName: agentName || 'Unknown Agent'
            }
          }
        );
        console.log(`✅ Updated enquiry ${enquiry._id} - assigned to ${agentName}`);
        updated++;
      } else {
        console.log(`⚠️ Skipping enquiry ${enquiry._id} - no agent found for visitor`);
        skipped++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Total enquiries processed: ${enquiriesWithoutTracking.length}`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️ Skipped: ${skipped}`);
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the migration
migrateEnquiryTracking();
