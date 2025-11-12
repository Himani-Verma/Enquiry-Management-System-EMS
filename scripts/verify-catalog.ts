/**
 * Script to verify TestCatalog documents in MongoDB
 */

import mongoose from 'mongoose';
import { connectMongo } from '../lib/mongo';
import TestCatalog from '../lib/models/TestCatalog';

async function verifyCatalog() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectMongo();
    console.log('✅ Connected to MongoDB\n');

    // Count all TestCatalog documents
    const totalCount = await TestCatalog.countDocuments({});
    console.log(`📊 Total TestCatalog documents: ${totalCount}\n`);

    // Count by service
    const foodCount = await TestCatalog.countDocuments({ serviceName: 'Food Testing' });
    const envCount = await TestCatalog.countDocuments({ serviceName: 'Environment Testing' });
    const envAltCount = await TestCatalog.countDocuments({ serviceName: 'Environmental Testing' });

    console.log('📋 TestCatalog documents by service:');
    console.log(`   Food Testing: ${foodCount}`);
    console.log(`   Environment Testing: ${envCount}`);
    console.log(`   Environmental Testing: ${envAltCount}\n`);

    // Get sample documents for Food Testing
    if (foodCount > 0) {
      console.log('📄 Sample Food Testing documents (first 5):');
      const samples = await TestCatalog.find({ serviceName: 'Food Testing' })
        .limit(5)
        .select('_id serviceName group testName method unit tatDays accreditationStatus department')
        .lean();
      
      samples.forEach((doc, index) => {
        console.log(`\n   ${index + 1}. ${doc.testName}`);
        console.log(`      Group: ${doc.group || '(none)'}`);
        console.log(`      Method: ${doc.method || '(none)'}`);
        console.log(`      Unit: ${doc.unit || '(none)'}`);
        console.log(`      TAT: ${doc.tatDays || '(none)'} days`);
        console.log(`      Accreditation: ${doc.accreditationStatus || '(none)'}`);
        console.log(`      Department: ${doc.department || '(none)'}`);
        console.log(`      ID: ${doc._id}`);
      });
    } else {
      console.log('⚠️  No Food Testing documents found');
    }

    // Get distinct groups for Food Testing
    if (foodCount > 0) {
      const groups = await TestCatalog.distinct('group', { serviceName: 'Food Testing' });
      const nonEmptyGroups = groups.filter(g => g != null && String(g).trim() !== '');
      console.log(`\n📂 Distinct groups for Food Testing (${nonEmptyGroups.length}):`);
      nonEmptyGroups.slice(0, 10).forEach((group, index) => {
        console.log(`   ${index + 1}. ${group}`);
      });
      if (nonEmptyGroups.length > 10) {
        console.log(`   ... and ${nonEmptyGroups.length - 10} more`);
      }
    }

    // Check indexes
    console.log('\n🔍 Checking indexes...');
    const indexes = await TestCatalog.collection.indexes();
    console.log(`   Found ${indexes.length} indexes:`);
    indexes.forEach((idx: any, index) => {
      const keys = Object.keys(idx.key || {}).join(', ');
      const unique = idx.unique ? ' (unique)' : '';
      const text = idx.textIndexVersion ? ' (text)' : '';
      console.log(`   ${index + 1}. ${keys}${unique}${text}`);
    });

    console.log('\n✅ Verification complete');

  } catch (error) {
    console.error('❌ Error verifying catalog:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

verifyCatalog();

