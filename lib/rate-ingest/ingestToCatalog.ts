/**
 * Ingest normalized rows into TestCatalog collection
 */

import { connectMongo } from '../mongo';
import TestCatalog, { makeFingerprint, makePrintableFallback } from '../models/TestCatalog';
import Service from '../models/Service';
import { projectSheetToRows } from './xlsxProject';
import { NormalizedRow } from './types';
import { FOOD_MAPPING, ENV_MAPPING } from './mappings';
import type { ExcelMapping } from './types';
import mongoose from 'mongoose';

export interface IngestToCatalogOptions {
  fileBuffer: Buffer;
  serviceName: string;
  sheetName: string;
  versionStamp: string;
  sourceFilePath: string;
  dryRun?: boolean;
}

export interface IngestReport {
  projected: number;            // rows after projector (pre-skip)
  processed: number;            // rows we attempted to upsert (after skips)
  insertedOrUpdated: string[];  // ObjectId strings
  skipped: number;              // rows skipped (no testName / in skipGroups)
  errors: Array<{ row?: any; message: string }>;
  sheetNameUsed: string;
  mappingUsed: 'FOOD' | 'ENV' | 'UNKNOWN';
}

export interface IngestToCatalogResult {
  count: number;
  insertedOrUpdated: mongoose.Types.ObjectId[];
  wouldIngestCount?: number;
  sampleRows?: NormalizedRow[];
  errors?: string[];
  // New detailed report
  ingestReport?: IngestReport;
}

/**
 * Get mapping for service name
 */
function getMappingForService(serviceName: string): ExcelMapping | null {
  const normalized = serviceName.trim();
  
  if (normalized === 'Food Testing') {
    return FOOD_MAPPING;
  }
  
  if (normalized === 'Environment Testing' || normalized === 'Environmental Testing') {
    return ENV_MAPPING;
  }
  
  // TODO: Water Testing mapping when available
  
  return null;
}

/**
 * Determine mapping type from service name
 */
function getMappingType(serviceName: string): 'FOOD' | 'ENV' | 'UNKNOWN' {
  const normalized = serviceName.trim();
  
  if (normalized === 'Food Testing') {
    return 'FOOD';
  }
  
  if (normalized === 'Environment Testing' || normalized === 'Environmental Testing') {
    return 'ENV';
  }
  
  return 'UNKNOWN';
}

/**
 * Resolve or create service ID from service name
 */
async function resolveServiceId(serviceName: string): Promise<mongoose.Types.ObjectId> {
  await connectMongo();
  
  // Try to find existing service
  let service: any = await (Service.findOne as any)({ 
    name: { $regex: new RegExp(`^${serviceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
  });
  
  if (!service) {
    // Create service if missing
    service = new Service({
      name: serviceName,
      category: serviceName,
      isActive: true,
      description: `Service for ${serviceName}`,
      subServices: [],
      requirements: [],
      estimatedDuration: '3-5 business days'
    });
    await service.save();
    console.log(`✨ Created new service: ${serviceName}`);
  }
  
  return service._id;
}

/**
 * Ingest normalized rows into TestCatalog
 */
export async function ingestToCatalog(opts: IngestToCatalogOptions): Promise<IngestToCatalogResult> {
  const { fileBuffer, serviceName, sheetName, versionStamp, sourceFilePath, dryRun = false } = opts;
  
  await connectMongo();
  
  // Get mapping for service
  const mapping = getMappingForService(serviceName);
  if (!mapping) {
    throw new Error(`No mapping configuration found for service: "${serviceName}". Supported services: Food Testing, Environment Testing`);
  }
  
  // Project sheet to normalized rows
  let normalizedRows: NormalizedRow[];
  try {
    normalizedRows = projectSheetToRows(fileBuffer, sheetName, mapping);
  } catch (error: any) {
    throw new Error(`Failed to project sheet "${sheetName}": ${error.message}`);
  }
  
  // Resolve service ID
  const serviceId = await resolveServiceId(serviceName);

  // Track metrics for detailed report
  const projected = normalizedRows.length;
  let processed = 0;
  let skipped = 0;
  const errors: Array<{ row?: any; message: string }> = [];
  const insertedOrUpdated: string[] = [];
  const mappingUsed = getMappingType(serviceName);

  // If dry run, return preview
  if (dryRun) {
    const report: IngestReport = {
      projected,
      processed: normalizedRows.length,
      insertedOrUpdated: [],
      skipped: 0,
      errors: [],
      sheetNameUsed: sheetName,
      mappingUsed
    };
    
    return {
      count: normalizedRows.length,
      insertedOrUpdated: [],
      wouldIngestCount: normalizedRows.length,
      sampleRows: normalizedRows.slice(0, 5),
      errors: [],
      ingestReport: report
    };
  }

  // Process each row
  for (const row of normalizedRows) {
    try {
      // Skip rows with missing testName (already filtered by projectSheetToRows, but double-check)
      if (!row.testName || row.testName.trim() === '') {
        skipped++;
        errors.push({
          row: { testName: row.testName || '(missing)', group: row.group },
          message: 'Row skipped: missing testName'
        });
        continue;
      }
      
      // Build TestCatalog document for fingerprint computation
      const catalogDoc: any = {
        serviceId,
        serviceName: row.serviceName,
        subVertical: row.subVertical || undefined,
        group: row.group || undefined,
        testName: row.testName,
        method: row.method || undefined,
        unit: row.unit || undefined,
        tatDays: row.tatDays || undefined,
        accreditationStatus: row.accreditationStatus || undefined,
        department: row.department || undefined
      };
      
      // Compute fingerprint locally (don't rely on pre-save hooks)
      const fingerprint = makeFingerprint(catalogDoc);
      
      // Compute printableText and printableSource
      const printableTextRaw = (row as any).printableTextRaw;
      const printableText =
        printableTextRaw && printableTextRaw.trim()
          ? printableTextRaw.trim()
          : makePrintableFallback({ method: row.method ?? null, testName: row.testName });
      const printableSource: 'sheet' | 'generated' =
        printableTextRaw && printableTextRaw.trim() ? 'sheet' : 'generated';
      
      // Upsert by fingerprint with proper MongoDB operations
      const updateQuery = {
        $setOnInsert: {
          serviceId,
          serviceName: row.serviceName,
          subVertical: row.subVertical || undefined,
          group: row.group || undefined,
          testName: row.testName,
          method: row.method || undefined,
          unit: row.unit || undefined,
          tatDays: row.tatDays || undefined,
          accreditationStatus: row.accreditationStatus || undefined,
          department: row.department || undefined,
          printableText,
          printableSource,
          source: {
            file: sourceFilePath,
            sheet: sheetName,
            versionStamp
          },
          fingerprint
        },
        $set: {
          // Always refresh these fields on update
          group: row.group ?? null,
          method: row.method ?? null,
          unit: row.unit ?? null,
          tatDays: row.tatDays ?? null,
          accreditationStatus: row.accreditationStatus ?? null,
          department: row.department ?? null,
          printableText,
          printableSource,
          source: {
            file: sourceFilePath,
            sheet: sheetName,
            versionStamp
          },
          updatedAt: new Date()
        }
      };
      
      const result = await TestCatalog.findOneAndUpdate(
        { fingerprint },
        updateQuery,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }
      );
      
      // Push doc._id to insertedOrUpdated (as string)
      insertedOrUpdated.push(result._id.toString());
      processed++;
      
    } catch (error: any) {
      const errorMsg = `Failed to upsert row with testName "${row.testName || '(missing)'}": ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      errors.push({
        row: {
          testName: row.testName,
          group: row.group,
          method: row.method
        },
        message: errorMsg
      });
      // Continue processing other rows
    }
  }
  
  // Build detailed report
  const ingestReport: IngestReport = {
    projected,
    processed,
    insertedOrUpdated,
    skipped,
    errors,
    sheetNameUsed: sheetName,
    mappingUsed
  };
  
  return {
    count: normalizedRows.length,
    insertedOrUpdated: insertedOrUpdated.map(id => new mongoose.Types.ObjectId(id)),
    errors: errors.map(e => e.message),
    ingestReport
  };
}

