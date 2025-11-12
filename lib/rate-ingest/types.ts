/**
 * Types for Excel mapping and normalization in rate ingestion
 */

export type ExcelMapping = {
  serviceName: string;
  headerRow: number;              // 1-based
  columns: Record<string, string[]>; // e.g., { testName: ['Test','Parameter'] }
  transforms?: Record<string, 'int' | 'trim' | 'upper' | 'lower'>;
  subVerticalFrom?: string;
  skipGroups?: string[];
  printableFrom?: string[];       // priority-ordered column names to use for printable text
};

export interface NormalizedRow {
  serviceName: string;
  subVertical?: string | null;
  group?: string | null;
  testName: string;
  method?: string | null;
  unit?: string | null;
  tatDays?: number | null;
  accreditationStatus?: 'Yes' | 'No' | 'NA' | null;
  department?: string | null;
}

