import mongoose, { Document, Schema } from 'mongoose';

// Quotation Item Interface
interface IQuotationItem {
  sNo: number;
  sampleName: string;
  testParameters?: string;
  noOfSamples: number;
  unitPrice: number;
  total: number;
}

// Additional Charge Interface
interface IAdditionalCharge {
  label: string;
  amount: number;
}

// Address Interface
interface IAddress {
  name: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pin?: string;
  email?: string;
  phone?: string;
}

// Contact Person Interface
interface IContactPerson {
  salutation?: string;
  name: string;
  phone?: string;
  email?: string;
}

// Tax Details Interface
interface ITaxDetails {
  cgstRate: number;
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
}

// Bank Details Interface
interface IBankDetails {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankNameBranch: string;
  accountType: string;
  micr?: string;
}

// Prepared By Interface
interface IPreparedBy {
  name: string;
  phone?: string;
  email?: string;
}

// Main Quotation Interface
export interface IQuotation extends Document {
  quotationNo: string;
  date: string;
  customerId?: string;
  vendorId?: string;
  
  // Parties
  billTo: IAddress;
  shipTo: IAddress;
  contact: IContactPerson;
  
  // Items and Charges
  items: IQuotationItem[];
  additionalCharges: IAdditionalCharge[];
  
  // Financial
  subtotal: number;
  taxes: ITaxDetails;
  grandTotal: number;
  amountInWords?: string;
  
  // Metadata
  preparedBy: IPreparedBy;
  bankDetails: IBankDetails;
  terms: string;
  
  // Status and Workflow
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  
  // Assignment
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  assignedTo?: mongoose.Types.ObjectId;
  assignedToName?: string;
  
  // Visitor/Customer Reference
  visitorId?: mongoose.Types.ObjectId;
  customerName: string;
  contactPerson: string;
  
  // Approval
  approvedBy?: mongoose.Types.ObjectId;
  approvedByName?: string;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedByName?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  // Email tracking
  sentAt?: Date;
  sentTo?: string;
  
  // File attachments
  pdfUrl?: string;
  docxUrl?: string;
  attachments?: string[];
  
  // History
  revisionHistory?: Array<{
    revisedAt: Date;
    revisedBy: string;
    changes: string;
  }>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy?: string;
}

// Mongoose Schema
const QuotationItemSchema = new Schema({
  sNo: { type: Number, required: true },
  sampleName: { type: String, required: true },
  testParameters: { type: String },
  noOfSamples: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
}, { _id: false });

const AdditionalChargeSchema = new Schema({
  label: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 }
}, { _id: false });

const AddressSchema = new Schema({
  name: { type: String, required: true },
  address1: { type: String },
  address2: { type: String },
  city: { type: String },
  state: { type: String },
  pin: { type: String },
  email: { type: String },
  phone: { type: String }
}, { _id: false });

const ContactPersonSchema = new Schema({
  salutation: { type: String, enum: ['Mr.', 'Ms.', 'Dr.', ''] },
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String }
}, { _id: false });

const TaxDetailsSchema = new Schema({
  cgstRate: { type: Number, required: true, default: 9 },
  sgstRate: { type: Number, required: true, default: 9 },
  cgstAmount: { type: Number, required: true, default: 0 },
  sgstAmount: { type: Number, required: true, default: 0 }
}, { _id: false });

const BankDetailsSchema = new Schema({
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifsc: { type: String, required: true },
  bankNameBranch: { type: String, required: true },
  accountType: { type: String, required: true },
  micr: { type: String }
}, { _id: false });

const PreparedBySchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String }
}, { _id: false });

const QuotationSchema = new Schema<IQuotation>({
  quotationNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  date: {
    type: String,
    required: true
  },
  customerId: { type: String },
  vendorId: { type: String },
  
  // Parties
  billTo: { type: AddressSchema, required: true },
  shipTo: { type: AddressSchema, required: true },
  contact: { type: ContactPersonSchema, required: true },
  
  // Items and Charges
  items: {
    type: [QuotationItemSchema],
    required: true,
    validate: {
      validator: function(items: IQuotationItem[]) {
        return items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  additionalCharges: {
    type: [AdditionalChargeSchema],
    default: []
  },
  
  // Financial
  subtotal: { type: Number, required: true, min: 0 },
  taxes: { type: TaxDetailsSchema, required: true },
  grandTotal: { type: Number, required: true, min: 0 },
  amountInWords: { type: String },
  
  // Metadata
  preparedBy: { type: PreparedBySchema, required: true },
  bankDetails: { type: BankDetailsSchema, required: true },
  terms: { type: String, required: true },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['draft', 'sent', 'approved', 'rejected', 'expired'],
    default: 'draft',
    index: true
  },
  
  // Assignment
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  createdByName: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  assignedToName: { type: String },
  
  // Visitor/Customer Reference
  visitorId: { type: Schema.Types.ObjectId, ref: 'Visitor', index: true },
  customerName: { type: String, required: true, index: true },
  contactPerson: { type: String, required: true },
  
  // Approval
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedByName: { type: String },
  approvedAt: { type: Date },
  rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectedByName: { type: String },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  
  // Email tracking
  sentAt: { type: Date },
  sentTo: { type: String },
  
  // File attachments
  pdfUrl: { type: String },
  docxUrl: { type: String },
  attachments: [{ type: String }],
  
  // History
  revisionHistory: [{
    revisedAt: { type: Date, default: Date.now },
    revisedBy: { type: String },
    changes: { type: String }
  }],
  
  // Last modified tracking
  lastModifiedBy: { type: String }
}, {
  timestamps: true
});

// Indexes for better query performance
QuotationSchema.index({ quotationNo: 1 });
QuotationSchema.index({ customerName: 1 });
QuotationSchema.index({ status: 1 });
QuotationSchema.index({ createdBy: 1 });
QuotationSchema.index({ assignedTo: 1 });
QuotationSchema.index({ createdAt: -1 });
QuotationSchema.index({ date: -1 });

// Virtual for formatted date
QuotationSchema.virtual('formattedDate').get(function() {
  const date = new Date(this.date);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
});

// Virtual for formatted amount
QuotationSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.grandTotal);
});

// Create and export the model
const Quotation = mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', QuotationSchema);
export default Quotation;

