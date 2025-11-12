/**
 * Demo script to test Excel projection to normalized rows
 * Run with: npm run dev:project
 */

import * as fs from 'fs';
import * as path from 'path';
import { projectSheetToRows } from '../lib/rate-ingest/xlsxProject';
import { FOOD_MAPPING } from '../lib/rate-ingest/mappings';

const excelFilePath = path.join(__dirname, '..', 'Rate List_Dated 24_12_2024.xlsx');

try {
  // Check if file exists
  if (!fs.existsSync(excelFilePath)) {
    console.error(`❌ Excel file not found at: ${excelFilePath}`);
    console.log('\nPlease ensure the file "Rate List_Dated 24_12_2024.xlsx" exists in the project root.');
    process.exit(1);
  }
  
  // Read file into buffer
  const buffer = fs.readFileSync(excelFilePath);
  
  console.log('📊 Excel Projection Demo\n');
  console.log('='.repeat(50));
  console.log(`Reading file: ${path.basename(excelFilePath)}`);
  console.log(`Sheet: Food`);
  console.log(`Mapping: FOOD_MAPPING\n`);
  
  // Project sheet to normalized rows
  const rows = projectSheetToRows(buffer, 'Food', FOOD_MAPPING);
  
  console.log(`✅ Processed ${rows.length} normalized rows\n`);
  console.log('='.repeat(50));
  console.log('\n📋 First 3 rows:\n');
  
  // Display first 3 rows
  rows.slice(0, 3).forEach((row, index) => {
    console.log(`Row ${index + 1}:`);
    console.log(`  serviceName: ${row.serviceName}`);
    console.log(`  group: ${row.group || '(null)'}`);
    console.log(`  testName: ${row.testName}`);
    console.log(`  method: ${row.method || '(null)'}`);
    console.log(`  accreditationStatus: ${row.accreditationStatus || '(null)'}`);
    console.log(`  department: ${row.department || '(null)'}`);
    console.log('');
  });
  
  console.log('='.repeat(50));
  console.log('✅ Demo completed!\n');
  
} catch (error: any) {
  console.error('❌ Error:', error.message);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  process.exit(1);
}

