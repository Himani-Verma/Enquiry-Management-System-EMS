import mongoose, { Document, Schema } from 'mongoose';

// Test Interface
interface ITest {
  name: string;
  parameters?: string[];
  unit: string;
  price: number;
  tat_days: number;
}

// Version Interface
interface IVersion {
  versionNumber: number;
  tests: ITest[];
  notes?: string;
  createdBy: string;
  createdAt: Date;
  catalogIds?: mongoose.Types.ObjectId[];
}

// Rate List Interface
export interface IRateList extends Document {
  category: string;
  service_id: mongoose.Types.ObjectId;
  tests: ITest[];
  versions: IVersion[];
  currentVersion: number;
  isActive: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Test Schema
const TestSchema = new Schema({
  name: { type: String, required: true, trim: true },
  parameters: [{ type: String, trim: true }],
  unit: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  tat_days: { type: Number, required: true, min: 1 }
}, { _id: false });

// Version Schema
const VersionSchema = new Schema({
  versionNumber: { type: Number, required: true },
  tests: { type: [TestSchema], required: true },
  notes: { type: String, trim: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  catalogIds: [{ type: Schema.Types.ObjectId, ref: 'TestCatalog' }]
}, { _id: false });

// Rate List Schema
const rateListSchema = new Schema<IRateList>({
  category: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  service_id: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
  tests: {
    type: [TestSchema],
    required: true,
    default: []
  },
  versions: {
    type: [VersionSchema],
    default: []
  },
  currentVersion: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
rateListSchema.index({ category: 1 });
rateListSchema.index({ service_id: 1 });
rateListSchema.index({ service_id: 1, category: 1 });
rateListSchema.index({ lastUpdated: -1 });

// Create and export the model
const RateList = mongoose.models.RateList || mongoose.model<IRateList>('RateList', rateListSchema);
export default RateList;

