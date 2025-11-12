/**
 * Excel worksheet projection to normalized rows
 */

import * as XLSX from 'xlsx';
import { ExcelMapping, NormalizedRow } from './types';
import { normalizeGroup, normalizeUnit, normalizeAccreditation, stringOrNull, intOrNull } from './normalize';

/**
 * Resolve header indexes by case-insensitive matching against column aliases
 */
export function resolveHeaderIndexes(headers: string[], mapping: ExcelMapping): Record<string, number | null> {
  const result: Record<string, number | null> = {};
  
  // Normalize headers for case-insensitive comparison
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  
  // For each logical field in mapping.columns, find the first matching header
  for (const [fieldName, aliases] of Object.entries(mapping.columns)) {
    let foundIndex: number | null = null;
    
    // Try each alias until we find a match
    for (const alias of aliases) {
      const normalizedAlias = alias.trim().toLowerCase();
      const index = normalizedHeaders.indexOf(normalizedAlias);
      if (index !== -1) {
        foundIndex = index;
        break;
      }
    }
    
    result[fieldName] = foundIndex;
  }
  
  return result;
}

/**
 * Apply transform to a value
 */
function applyTransform(value: unknown, transform: 'int' | 'trim' | 'upper' | 'lower'): unknown {
  if (value == null) return value;
  
  if (transform === 'int') {
    return intOrNull(value);
  }
  
  const str = String(value);
  
  if (transform === 'trim') {
    return str.trim();
  }
  
  if (transform === 'upper') {
    return str.toUpperCase();
  }
  
  if (transform === 'lower') {
    return str.toLowerCase();
  }
  
  return value;
}

/**
 * Project an Excel sheet to normalized rows using a mapping
 */
export function projectSheetToRows(buffer: Buffer, sheetName: string, mapping: ExcelMapping): NormalizedRow[] {
  // Read workbook from buffer
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Check if sheet exists
  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`Sheet "${sheetName}" not found in workbook. Available sheets: ${workbook.SheetNames.join(', ')}`);
  }
  
  // Get the worksheet
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON array format
  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  
  if (jsonData.length === 0) {
    return [];
  }
  
  // Extract header row (1-based, so subtract 1 for array index)
  const headerRowIndex = mapping.headerRow - 1;
  if (headerRowIndex < 0 || headerRowIndex >= jsonData.length) {
    throw new Error(`Header row ${mapping.headerRow} is out of range (sheet has ${jsonData.length} rows)`);
  }
  
  const rawHeaders = jsonData[headerRowIndex] || [];
  const headers = rawHeaders.map((h: unknown) => String(h || '').trim());
  
  // Resolve header indexes
  const headerIndexes = resolveHeaderIndexes(headers, mapping);
  
  // Also resolve subVerticalFrom if specified
  let subVerticalIndex: number | null = null;
  if (mapping.subVerticalFrom) {
    const normalizedHeaders = headers.map(h => h.toLowerCase());
    const normalizedSubVertical = mapping.subVerticalFrom.trim().toLowerCase();
    subVerticalIndex = normalizedHeaders.indexOf(normalizedSubVertical);
    if (subVerticalIndex === -1) {
      subVerticalIndex = null;
    }
  }
  
  // Resolve printableFrom column indexes
  const printableFromIndexes: number[] = [];
  if (mapping.printableFrom?.length) {
    const normalizedHeaders = headers.map(h => h.toLowerCase());
    for (const col of mapping.printableFrom) {
      const normalizedCol = col.trim().toLowerCase();
      const idx = normalizedHeaders.indexOf(normalizedCol);
      if (idx !== -1) {
        printableFromIndexes.push(idx);
      }
    }
  }
  
  // Iterate rows below the header row
  const rows: NormalizedRow[] = [];
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    // Stop at fully empty row
    const isEmptyRow = row.every((cell: unknown) => {
      if (cell == null) return true;
      const val = String(cell).trim();
      return val === '';
    });
    if (isEmptyRow) {
      break;
    }
    
    // Read values by resolved indexes
    const rawValues: Record<string, unknown> = {};
    for (const [fieldName, index] of Object.entries(headerIndexes)) {
      if (index !== null && index >= 0 && index < row.length) {
        rawValues[fieldName] = row[index];
      } else {
        rawValues[fieldName] = null;
      }
    }
    
    // Read subVertical if specified
    let subVertical: string | null = null;
    if (subVerticalIndex !== null && subVerticalIndex >= 0 && subVerticalIndex < row.length) {
      subVertical = stringOrNull(row[subVerticalIndex]);
    }
    
    // Extract printableTextRaw from printableFrom columns (priority order)
    let printableTextRaw: string | null = null;
    if (printableFromIndexes.length > 0) {
      for (const idx of printableFromIndexes) {
        if (idx != null && idx >= 0 && idx < row.length) {
          const v = stringOrNull(row[idx]);
          if (v) {
            printableTextRaw = v;
            break;
          }
        }
      }
    }
    
    // Apply transforms
    const transformedValues: Record<string, unknown> = {};
    for (const [fieldName, value] of Object.entries(rawValues)) {
      const transform = mapping.transforms?.[fieldName];
      if (transform) {
        transformedValues[fieldName] = applyTransform(value, transform);
      } else {
        transformedValues[fieldName] = value;
      }
    }
    
    // Apply normalizers
    const group = normalizeGroup(transformedValues.group as string | null);
    const unit = normalizeUnit(transformedValues.unit as string | null);
    const accreditationStatus = normalizeAccreditation(transformedValues.accreditationStatus as string | null);
    const tatDays = intOrNull(transformedValues.tatDays);
    const testName = stringOrNull(transformedValues.testName);
    const method = stringOrNull(transformedValues.method);
    const department = stringOrNull(transformedValues.department);
    
    // Skip row if testName is empty/null
    if (!testName) {
      continue;
    }
    
    // Skip row if group is in skipGroups (case-insensitive comparison)
    if (group && mapping.skipGroups) {
      const normalizedGroupForSkip = group.trim();
      const shouldSkip = mapping.skipGroups.some(skipGroup => 
        skipGroup.trim().toLowerCase() === normalizedGroupForSkip.toLowerCase()
      );
      if (shouldSkip) {
        continue;
      }
    }
    
    // Create normalized row
    const normalizedRow: NormalizedRow = {
      serviceName: mapping.serviceName,
      subVertical: subVertical || null,
      group: group || null,
      testName,
      method: method || null,
      unit: unit || null,
      tatDays: tatDays || null,
      accreditationStatus: accreditationStatus || null,
      department: department || null,
    };
    
    // Attach printableTextRaw as ad-hoc property for ingest stage
    // @ts-expect-error – carried forward to ingestToCatalog
    (normalizedRow as any).printableTextRaw = printableTextRaw;
    
    rows.push(normalizedRow);
  }
  
  return rows;
}

