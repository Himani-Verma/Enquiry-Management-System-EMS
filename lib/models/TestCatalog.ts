import mongoose, { Document, Schema } from 'mongoose';
import { createHash } from 'crypto';

// Source Interface
interface ISource {
  file: string;
  sheet: string;
  versionStamp: string;
}

// Test Catalog Interface
export interface ITestCatalog extends Document {
  serviceId: mongoose.Types.ObjectId;
  serviceName: string;
  subVertical?: string;
  group?: string;
  testName: string;
  method?: string;
  unit?: string;
  tatDays?: number;
  accreditationStatus?: 'Yes' | 'No' | 'NA';
  department?: string;
  printableText?: string | null;
  printableSource?: 'sheet' | 'generated';
  params?: string[];
  source: ISource;
  fingerprint: string;
  createdAt: Date;
  updatedAt: Date;
}

// Source Schema
const SourceSchema = new Schema({
  file: { type: String, required: true },
  sheet: { type: String, required: true },
  versionStamp: { type: String, required: true }
}, { _id: false });

// Test Catalog Schema
const testCatalogSchema = new Schema<ITestCatalog>({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  subVertical: {
    type: String,
    trim: true,
    index: true
  },
  group: {
    type: String,
    trim: true,
    index: true
  },
  testName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  method: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    trim: true
  },
  tatDays: {
    type: Number,
    min: 0
  },
  accreditationStatus: {
    type: String,
    enum: ['Yes', 'No', 'NA']
  },
  department: {
    type: String,
    trim: true
  },
  printableText: {
    type: String,
    default: null,
    index: true
  },
  printableSource: {
    type: String,
    enum: ['sheet', 'generated'],
    default: 'generated'
  },
  params: {
    type: [String],
    default: undefined
  },
  source: {
    type: SourceSchema,
    required: true
  },
  fingerprint: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound Indexes
testCatalogSchema.index({ serviceName: 1, subVertical: 1, group: 1 });
testCatalogSchema.index({ testName: 'text', method: 'text', group: 'text', printableText: 'text' });
testCatalogSchema.index({ fingerprint: 1 }, { unique: true });

// Helper function to make printable fallback
export function makePrintableFallback(row: { method?: string | null; testName: string }): string {
  return (row.method && row.method.trim()) || row.testName;
}

// Helper function to make fingerprint
export function makeFingerprint(doc: Partial<ITestCatalog> | ITestCatalog): string {
  const parts = [
    doc.serviceName || '',
    '|',
    doc.subVertical || '',
    '|',
    (doc.testName || '').trim().toLowerCase(),
    '|',
    doc.method || '',
    '|',
    doc.unit || ''
  ];
  
  const fingerprintString = parts.join('');
  const hash = createHash('sha256').update(fingerprintString).digest('hex').toLowerCase();
  return hash;
}

// Pre-save hook to compute fingerprint if not provided
testCatalogSchema.pre('save', function(next) {
  if (!this.fingerprint || this.isModified('serviceName') || this.isModified('subVertical') || 
      this.isModified('testName') || this.isModified('method') || this.isModified('unit')) {
    this.fingerprint = makeFingerprint(this);
  }
  next();
});

// Create and export the model
const TestCatalog = mongoose.models.TestCatalog || mongoose.model<ITestCatalog>('TestCatalog', testCatalogSchema);
export default TestCatalog;

