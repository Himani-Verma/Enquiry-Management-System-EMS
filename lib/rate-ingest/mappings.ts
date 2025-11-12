/**
 * Static mapping configurations for Excel ingestion
 */

import { ExcelMapping } from './types';

// Mapping for the Food sheet in "Rate List_Dated 24_12_2024.xlsx"
export const FOOD_MAPPING: ExcelMapping = {
  serviceName: 'Food Testing',
  headerRow: 6, // adjust if your header is on a different row
  columns: {
    group: ['Group'],
    testName: ['Test Parameter', 'Test', 'Parameter', 'Analyte'],
    method: ['Method overview', 'Test Method', 'Method', 'Standard'],
    accreditationStatus: ['Accreditation status', 'Accreditation Status'],
    department: ['Department']
    // NOTE: Unit/TAT often not present in Food; leave unmapped here.
  },
  transforms: { method: 'upper' },
  // If you ever add a dedicated printable column, list it first:
  printableFrom: ['Parameters', 'Method overview', 'Comments']
};

// Mapping for the Environment Draft sheet
export const ENV_MAPPING: ExcelMapping = {
  serviceName: 'Environment Testing',
  headerRow: 1,
  columns: {
    subVertical: ['Sub Vertical'],
    group: ['Group'],
    testName: ['Test', 'Parameter', 'Analyte'],
    method: ['Method', 'Standard'],
    tatDays: ['TAT (Days)', 'TAT Days', 'TAT'],
    unit: ['Unit', 'UOM'],
    accreditationStatus: ['Accreditation Status', 'Accreditation status'],
    department: ['Department']
  },
  subVerticalFrom: 'Sub Vertical',
  skipGroups: ['Sampling And Transportation Cost', 'Lodging and Boarding Cost'],
  transforms: { method: 'upper' }
};

