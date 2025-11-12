/**
 * Demo script to test normalization utilities
 * Run with: npm run dev:normalize
 */

import {
  normalizeGroup,
  normalizeUnit,
  normalizeAccreditation,
  intOrNull,
  stringOrNull,
  titleCase,
} from '../lib/rate-ingest/normalize';

console.log('🧪 Normalization Utilities Demo\n');
console.log('=' .repeat(50));

// Test normalizeGroup
console.log('\n📦 normalizeGroup():');
console.log(`  normalizeGroup('Physical Parametes') → "${normalizeGroup('Physical Parametes')}"`);
console.log(`  normalizeGroup('chemical parameters') → "${normalizeGroup('chemical parameters')}"`);
console.log(`  normalizeGroup(null) → ${normalizeGroup(null)}`);

// Test normalizeUnit
console.log('\n📏 normalizeUnit():');
console.log(`  normalizeUnit('ug m-3') → "${normalizeUnit('ug m-3')}"`);
console.log(`  normalizeUnit('mgl-1') → "${normalizeUnit('mgl-1')}"`);
console.log(`  normalizeUnit('ug/m3') → "${normalizeUnit('ug/m3')}"`);
console.log(`  normalizeUnit('mg/L') → "${normalizeUnit('mg/L')}"`);

// Test normalizeAccreditation
console.log('\n✅ normalizeAccreditation():');
console.log(`  normalizeAccreditation(' NA ') → "${normalizeAccreditation(' NA ')}"`);
console.log(`  normalizeAccreditation('yes') → "${normalizeAccreditation('yes')}"`);
console.log(`  normalizeAccreditation('n/a') → "${normalizeAccreditation('n/a')}"`);

// Test intOrNull
console.log('\n🔢 intOrNull():');
console.log(`  intOrNull('4.9') → ${intOrNull('4.9')}`);
console.log(`  intOrNull('123') → ${intOrNull('123')}`);
console.log(`  intOrNull('abc') → ${intOrNull('abc')}`);
console.log(`  intOrNull(456.78) → ${intOrNull(456.78)}`);

// Test stringOrNull
console.log('\n📝 stringOrNull():');
console.log(`  stringOrNull('  hello  ') → "${stringOrNull('  hello  ')}"`);
console.log(`  stringOrNull('   ') → ${stringOrNull('   ')}`);
console.log(`  stringOrNull(123) → "${stringOrNull(123)}"`);

// Test titleCase
console.log('\n📋 titleCase():');
console.log(`  titleCase('hello world') → "${titleCase('hello world')}"`);
console.log(`  titleCase('PHYSICAL-CHEMICAL') → "${titleCase('PHYSICAL-CHEMICAL')}"`);

console.log('\n' + '='.repeat(50));
console.log('✅ Demo completed!\n');

