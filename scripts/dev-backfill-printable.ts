/**
 * Migration script to backfill printableText and printableSource fields
 * Run with: npm run dev:backfill:printable
 */

import mongoose from 'mongoose';
import { connectMongo } from '../lib/mongo';
import TestCatalog, { makePrintableFallback } from '../lib/models/TestCatalog';

async function backfillPrintable() {
  try {
    console.log('🔄 Starting printable fields backfill...\n');
    
    // Connect to MongoDB
    await connectMongo();
    console.log('✅ Connected to MongoDB\n');
    
    // Get total count
    const totalCount = await TestCatalog.countDocuments({});
    console.log(`📊 Found ${totalCount} documents to process\n`);
    
    if (totalCount === 0) {
      console.log('✅ No documents to process. Exiting.');
      await mongoose.disconnect();
      return;
    }
    
    // Process in batches
    const BATCH_SIZE = 100;
    let processed = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    let skip = 0;
    let hasMore = true;
    
    while (hasMore) {
      // Fetch batch
      const batch = await TestCatalog.find({})
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean();
      
      if (batch.length === 0) {
        hasMore = false;
        break;
      }
      
      // Process each document in the batch
      const updatePromises = batch.map(async (doc: any) => {
        try {
          const printableText = doc.printableText ?? makePrintableFallback({
            method: doc.method,
            testName: doc.testName
          });
          
          const printableSource = doc.printableText ? 'sheet' : 'generated';
          
          // Only update if values have changed
          if (doc.printableText !== printableText || doc.printableSource !== printableSource) {
            await TestCatalog.updateOne(
              { _id: doc._id },
              {
                $set: {
                  printableText: printableText,
                  printableSource: printableSource
                }
              }
            );
            updated++;
            return true;
          } else {
            skipped++;
            return false;
          }
        } catch (error: any) {
          console.error(`❌ Error processing document ${doc._id}:`, error.message);
          errors++;
          return false;
        }
      });
      
      await Promise.all(updatePromises);
      processed += batch.length;
      
      // Progress update
      const progress = ((processed / totalCount) * 100).toFixed(1);
      console.log(`📈 Progress: ${processed}/${totalCount} (${progress}%) - Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
      
      skip += BATCH_SIZE;
      hasMore = batch.length === BATCH_SIZE;
    }
    
    console.log('\n✅ Backfill completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total processed: ${processed}`);
    console.log(`   - Updated: ${updated}`);
    console.log(`   - Skipped: ${skipped}`);
    console.log(`   - Errors: ${errors}`);
    
    // Verify the update
    const withGenerated = await TestCatalog.countDocuments({ printableSource: 'generated' });
    const withSheet = await TestCatalog.countDocuments({ printableSource: 'sheet' });
    const withPrintableText = await TestCatalog.countDocuments({ printableText: { $ne: null } });
    
    console.log('\n📋 Verification:');
    console.log(`   - Documents with printableSource='generated': ${withGenerated}`);
    console.log(`   - Documents with printableSource='sheet': ${withSheet}`);
    console.log(`   - Documents with printableText set: ${withPrintableText}`);
    
    await mongoose.disconnect();
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
backfillPrintable()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

