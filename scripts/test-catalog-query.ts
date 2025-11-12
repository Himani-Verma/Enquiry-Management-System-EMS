/**
 * Quick test script to verify catalog data exists
 * Run with: npm run dev:test:catalog
 */

import mongoose from 'mongoose';
import { connectMongo } from '../lib/mongo';
import TestCatalog from '../lib/models/TestCatalog';

async function testCatalogQuery() {
  try {
    console.log('🔍 Testing Catalog Query...\n');
    
    await connectMongo();
    console.log('✅ Connected to MongoDB\n');
    
    // Check total documents
    const totalDocs = await TestCatalog.countDocuments({});
    console.log(`📊 Total TestCatalog documents: ${totalDocs}\n`);
    
    if (totalDocs === 0) {
      console.log('⚠️  No documents found in TestCatalog collection!');
      console.log('    You need to upload a rate list first.\n');
      return;
    }
    
    // Check by service name
    const services = await TestCatalog.distinct('serviceName');
    console.log(`📋 Available services: ${services.join(', ')}\n`);
    
    // Check Food Testing specifically
    const foodTestingCount = await TestCatalog.countDocuments({ serviceName: 'Food Testing' });
    console.log(`🍔 Food Testing documents: ${foodTestingCount}\n`);
    
    if (foodTestingCount === 0) {
      console.log('⚠️  No Food Testing documents found!');
      console.log('    Service names in database:', services);
      console.log('    Make sure you uploaded with service="Food Testing"\n');
      return;
    }
    
    // Test search queries
    const testQueries = ['cashew', 'his', 'histamine', 'test'];
    
    for (const searchTerm of testQueries) {
      console.log(`\n🔍 Testing search for "${searchTerm}":`);
      
      // Try regex search
      const regex = new RegExp(searchTerm, 'i');
      const regexResults = await TestCatalog.countDocuments({
        serviceName: 'Food Testing',
        $or: [
          { testName: regex },
          { printableText: regex },
          { method: regex }
        ]
      });
      console.log(`   Regex search: ${regexResults} results`);
      
      // Try exact match on testName
      const exactResults = await TestCatalog.countDocuments({
        serviceName: 'Food Testing',
        testName: { $regex: searchTerm, $options: 'i' }
      });
      console.log(`   TestName match: ${exactResults} results`);
      
      // Get sample results
      const samples = await TestCatalog.find({
        serviceName: 'Food Testing',
        $or: [
          { testName: regex },
          { printableText: regex },
          { method: regex }
        ]
      }).limit(3).select('testName printableText method').lean();
      
      if (samples.length > 0) {
        console.log(`   Sample results:`);
        samples.forEach((item: any, idx: number) => {
          console.log(`     ${idx + 1}. ${item.testName}`);
          if (item.printableText) console.log(`        Printable: ${item.printableText.substring(0, 50)}...`);
        });
      }
    }
    
    // Get some sample documents to verify structure
    console.log('\n📄 Sample documents:');
    const samples = await TestCatalog.find({ serviceName: 'Food Testing' })
      .limit(3)
      .select('testName printableText method group serviceName')
      .lean();
    
    samples.forEach((doc: any, idx: number) => {
      console.log(`\n   Document ${idx + 1}:`);
      console.log(`     testName: "${doc.testName}"`);
      console.log(`     printableText: "${doc.printableText || '(null)'}"`);
      console.log(`     method: "${doc.method || '(null)'}"`);
      console.log(`     group: "${doc.group || '(null)'}"`);
      console.log(`     serviceName: "${doc.serviceName}"`);
    });
    
    if (TestCatalog.db) {
      await TestCatalog.db.close();
    } else {
      await mongoose.disconnect();
    }
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCatalogQuery()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

