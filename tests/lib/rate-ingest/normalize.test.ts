/**
 * Unit tests for rate ingestion normalization utilities
 */

import {
  normalizeGroup,
  normalizeUnit,
  normalizeAccreditation,
  stringOrNull,
  intOrNull,
  titleCase,
} from '@/lib/rate-ingest/normalize';

describe('Rate Ingestion Normalization Utilities', () => {
  describe('normalizeGroup()', () => {
    test('returns null for empty or null input', () => {
      expect(normalizeGroup(null)).toBeNull();
      expect(normalizeGroup(undefined)).toBeNull();
      expect(normalizeGroup('')).toBeNull();
      expect(normalizeGroup('   ')).toBeNull();
    });

    test('fixes common typos', () => {
      expect(normalizeGroup('physical parametes')).toBe('Physical Parameters');
      expect(normalizeGroup('Physical Parameters')).toBe('Physical Parameters');
      expect(normalizeGroup('chemical parameters')).toBe('Chemical Parameters');
    });

    test('title-cases group names', () => {
      expect(normalizeGroup('physical parameters')).toBe('Physical Parameters');
      expect(normalizeGroup('PHYSICAL PARAMETERS')).toBe('Physical Parameters');
      expect(normalizeGroup('physical-CHEMICAL')).toBe('Physical-Chemical');
    });

    test('handles hyphenated words correctly', () => {
      expect(normalizeGroup('physico-chemical')).toBe('Physico-Chemical');
      expect(normalizeGroup('physical-chemical parameters')).toBe('Physical-Chemical Parameters');
    });
  });

  describe('normalizeUnit()', () => {
    test('returns null for empty or null input', () => {
      expect(normalizeUnit(null)).toBeNull();
      expect(normalizeUnit(undefined)).toBeNull();
      expect(normalizeUnit('')).toBeNull();
      expect(normalizeUnit('   ')).toBeNull();
    });

    test('normalizes mg/L variants', () => {
      expect(normalizeUnit('mg/L')).toBe('mg/L');
      expect(normalizeUnit('mgl-1')).toBe('mg/L');
      expect(normalizeUnit('mg l-1')).toBe('mg/L');
      expect(normalizeUnit('mg l⁻¹')).toBe('mg/L');
      expect(normalizeUnit('mgl⁻¹')).toBe('mg/L');
    });

    test('normalizes µg/m³ variants', () => {
      expect(normalizeUnit('ug/m3')).toBe('µg/m³');
      expect(normalizeUnit('ug/m³')).toBe('µg/m³');
      expect(normalizeUnit('μg/m3')).toBe('µg/m³');
      expect(normalizeUnit('ug m-3')).toBe('µg/m³');
      expect(normalizeUnit('ug m⁻³')).toBe('µg/m³');
    });

    test('normalizes g/L variants', () => {
      expect(normalizeUnit('g/L')).toBe('g/L');
      expect(normalizeUnit('gl-1')).toBe('g/L');
      expect(normalizeUnit('g l-1')).toBe('g/L');
      expect(normalizeUnit('gl⁻¹')).toBe('g/L');
    });

    test('handles other common units', () => {
      expect(normalizeUnit('ppm')).toBe('ppm');
      expect(normalizeUnit('%')).toBe('%');
      expect(normalizeUnit('percent')).toBe('%');
      expect(normalizeUnit('°c')).toBe('°C');
      expect(normalizeUnit('NTU')).toBe('NTU');
      expect(normalizeUnit('ph')).toBe('pH');
      expect(normalizeUnit('db(a)')).toBe('dB(A)');
    });

    test('returns trimmed original if no normalization found', () => {
      expect(normalizeUnit('custom unit')).toBe('custom unit');
      expect(normalizeUnit('  custom unit  ')).toBe('custom unit');
    });
  });

  describe('normalizeAccreditation()', () => {
    test('returns null for empty or null input', () => {
      expect(normalizeAccreditation(null)).toBeNull();
      expect(normalizeAccreditation(undefined)).toBeNull();
      expect(normalizeAccreditation('')).toBeNull();
    });

    test('normalizes "Yes" variants', () => {
      expect(normalizeAccreditation('yes')).toBe('Yes');
      expect(normalizeAccreditation('Yes')).toBe('Yes');
      expect(normalizeAccreditation('YES')).toBe('Yes');
      expect(normalizeAccreditation('y')).toBe('Yes');
      expect(normalizeAccreditation('true')).toBe('Yes');
      expect(normalizeAccreditation('1')).toBe('Yes');
    });

    test('normalizes "No" variants', () => {
      expect(normalizeAccreditation('no')).toBe('No');
      expect(normalizeAccreditation('No')).toBe('No');
      expect(normalizeAccreditation('NO')).toBe('No');
      expect(normalizeAccreditation('n')).toBe('No');
      expect(normalizeAccreditation('false')).toBe('No');
      expect(normalizeAccreditation('0')).toBe('No');
    });

    test('normalizes "NA" variants', () => {
      expect(normalizeAccreditation('na')).toBe('NA');
      expect(normalizeAccreditation('NA')).toBe('NA');
      expect(normalizeAccreditation('n/a')).toBe('NA');
      expect(normalizeAccreditation('N/A')).toBe('NA');
      expect(normalizeAccreditation('not applicable')).toBe('NA');
      expect(normalizeAccreditation('not available')).toBe('NA');
    });

    test('returns null for unrecognized values', () => {
      expect(normalizeAccreditation('maybe')).toBeNull();
      expect(normalizeAccreditation('unknown')).toBeNull();
      expect(normalizeAccreditation('xyz')).toBeNull();
    });
  });

  describe('stringOrNull()', () => {
    test('returns null for null or undefined', () => {
      expect(stringOrNull(null)).toBeNull();
      expect(stringOrNull(undefined)).toBeNull();
    });

    test('trims empty strings to null', () => {
      expect(stringOrNull('')).toBeNull();
      expect(stringOrNull('   ')).toBeNull();
    });

    test('returns trimmed string for valid input', () => {
      expect(stringOrNull('hello')).toBe('hello');
      expect(stringOrNull('  hello  ')).toBe('hello');
      expect(stringOrNull('  hello world  ')).toBe('hello world');
    });

    test('converts numbers to strings', () => {
      expect(stringOrNull(123)).toBe('123');
      expect(stringOrNull(0)).toBe('0');
      expect(stringOrNull(-123)).toBe('-123');
    });

    test('handles NaN', () => {
      expect(stringOrNull(NaN)).toBeNull();
    });

    test('converts other types to strings', () => {
      expect(stringOrNull(true)).toBe('true');
      expect(stringOrNull(false)).toBe('false');
    });
  });

  describe('intOrNull()', () => {
    test('returns null for null or undefined', () => {
      expect(intOrNull(null)).toBeNull();
      expect(intOrNull(undefined)).toBeNull();
    });

    test('returns null for empty strings', () => {
      expect(intOrNull('')).toBeNull();
      expect(intOrNull('   ')).toBeNull();
    });

    test('parses valid integers', () => {
      expect(intOrNull('123')).toBe(123);
      expect(intOrNull('0')).toBe(0);
      expect(intOrNull('-123')).toBe(-123);
      expect(intOrNull('  456  ')).toBe(456);
    });

    test('handles number inputs', () => {
      expect(intOrNull(123)).toBe(123);
      expect(intOrNull(0)).toBe(0);
      expect(intOrNull(-123)).toBe(-123);
      expect(intOrNull(123.456)).toBe(123);
      expect(intOrNull(123.789)).toBe(123);
    });

    test('returns null for invalid inputs', () => {
      expect(intOrNull('abc')).toBeNull();
      expect(intOrNull('12.34')).toBe(12); // parseInt truncates
      expect(intOrNull(NaN)).toBeNull();
      expect(intOrNull(Infinity)).toBeNull();
    });
  });

  describe('titleCase()', () => {
    test('returns empty string for empty input', () => {
      expect(titleCase('')).toBe('');
    });

    test('converts to title case', () => {
      expect(titleCase('hello')).toBe('Hello');
      expect(titleCase('HELLO')).toBe('Hello');
      expect(titleCase('hello world')).toBe('Hello World');
      expect(titleCase('HELLO WORLD')).toBe('Hello World');
    });

    test('handles hyphenated words', () => {
      expect(titleCase('physical-chemical')).toBe('Physical-Chemical');
      expect(titleCase('PHYSICAL-CHEMICAL')).toBe('Physical-Chemical');
      expect(titleCase('physico-chemical parameters')).toBe('Physico-Chemical Parameters');
    });

    test('handles multiple spaces', () => {
      expect(titleCase('hello    world')).toBe('Hello World');
      expect(titleCase('  hello   world  ')).toBe('Hello World');
    });
  });
});

