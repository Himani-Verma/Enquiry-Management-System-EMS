/**
 * Normalization utilities for rate ingestion
 */

/**
 * Normalize group string - fixes common typos and title-cases
 */
export function normalizeGroup(s?: string | null): string | null {
  if (!s) return null;
  
  let normalized = s.trim();
  if (!normalized) return null;
  
  // Fix common typos
  const typoMap: Record<string, string> = {
    'physical parametes': 'Physical Parameters',
    'physical parameters': 'Physical Parameters',
    'chemical parameters': 'Chemical Parameters',
    'biological parameters': 'Biological Parameters',
    'microbiological parameters': 'Microbiological Parameters',
    'physical-chemical': 'Physical-Chemical',
    'physico-chemical': 'Physico-Chemical',
  };
  
  const lowerKey = normalized.toLowerCase();
  if (typoMap[lowerKey]) {
    return typoMap[lowerKey];
  }
  
  // Title case
  return titleCase(normalized);
}

/**
 * Normalize unit string - unifies variants like mg/L, mgL-1, mg l-1 → mg/L
 */
export function normalizeUnit(s?: string | null): string | null {
  if (!s) return null;
  
  let normalized = s.trim();
  if (!normalized) return null;
  
  // Common unit normalizations
  const unitMap: Record<string, string> = {
    // Mass per volume variants
    'mgl-1': 'mg/L',
    'mg l-1': 'mg/L',
    'mg/l': 'mg/L',
    'mg l⁻¹': 'mg/L',
    'mgl⁻¹': 'mg/L',
    
    // Micrograms per cubic meter variants
    'ug/m3': 'µg/m³',
    'ug/m³': 'µg/m³',
    'μg/m3': 'µg/m³',
    'ug m-3': 'µg/m³',
    'ug m⁻³': 'µg/m³',
    'μg m⁻³': 'µg/m³',
    
    // Grams per liter variants
    'gl-1': 'g/L',
    'g l-1': 'g/L',
    'g/l': 'g/L',
    'gl⁻¹': 'g/L',
    'g l⁻¹': 'g/L',
    
    // Parts per million variants
    'ppm': 'ppm',
    'ppb': 'ppb',
    
    // Percent variants
    '%': '%',
    'percent': '%',
    'pct': '%',
    
    // Temperature variants
    '°c': '°C',
    '°f': '°F',
    'celsius': '°C',
    'fahrenheit': '°F',
    
    // Other common variants
    'ntu': 'NTU',
    'ph': 'pH',
    'db': 'dB',
    'db(a)': 'dB(A)',
    'mgl': 'mg/L',
  };
  
  const lowerKey = normalized.toLowerCase().replace(/\s+/g, '');
  if (unitMap[lowerKey]) {
    return unitMap[lowerKey];
  }
  
  // Try pattern matching for common formats
  // mg/L pattern: mgL-1, mg l-1, etc.
  const mgLPattern = /^mg\s*l[-⁻]?1$/i;
  if (mgLPattern.test(lowerKey)) {
    return 'mg/L';
  }
  
  // µg/m³ pattern: ug/m3, ug/m³, etc.
  const ugM3Pattern = /^(ug|μg)\s*m[-⁻]?3$/i;
  if (ugM3Pattern.test(lowerKey)) {
    return 'µg/m³';
  }
  
  // Return trimmed original if no match
  return normalized;
}

/**
 * Normalize accreditation status
 */
export function normalizeAccreditation(s?: string | null): 'Yes' | 'No' | 'NA' | null {
  if (!s) return null;
  
  const normalized = s.trim().toLowerCase();
  
  if (normalized === 'yes' || normalized === 'y' || normalized === 'true' || normalized === '1') {
    return 'Yes';
  }
  
  if (normalized === 'no' || normalized === 'n' || normalized === 'false' || normalized === '0') {
    return 'No';
  }
  
  if (normalized === 'na' || normalized === 'n/a' || normalized === 'not applicable' || normalized === 'not available') {
    return 'NA';
  }
  
  return null;
}

/**
 * Convert value to string or null (trims empty to null)
 */
export function stringOrNull(s: unknown): string | null {
  if (s == null) return null;
  if (typeof s === 'number') {
    return isNaN(s) ? null : String(s);
  }
  if (typeof s !== 'string') {
    return String(s);
  }
  const trimmed = s.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Convert value to integer or null (invalid → null)
 */
export function intOrNull(n: unknown): number | null {
  if (n == null) return null;
  if (typeof n === 'number') {
    return isNaN(n) || !isFinite(n) ? null : Math.floor(n);
  }
  if (typeof n === 'string') {
    const trimmed = n.trim();
    if (trimmed === '') return null;
    const parsed = parseInt(trimmed, 10);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Convert string to title case
 */
export function titleCase(s: string): string {
  if (!s) return '';
  
  return s
    .toLowerCase()
    .split(/\s+/)
    .map(word => {
      if (word.length === 0) return word;
      // Handle hyphenated words
      if (word.includes('-')) {
        return word
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('-');
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

