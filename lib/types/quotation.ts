export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'

export type FormStep = 'header' | 'items' | 'taxes' | 'prepared' | 'terms'

export interface Address {
  name: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  pin?: string
  email?: string
  phone?: string
}

export interface ContactPerson {
  salutation?: 'Mr.' | 'Ms.' | 'Dr.' | ''
  name: string
  phone?: string
  email?: string
}

export interface QuotationItem {
  id: string
  sNo: number
  sampleName: string
  testParameters?: string
  description?: string
  noOfSamples: number
  quantity?: number
  unitPrice: number
  total: number
}

export interface AdditionalCharge {
  id: string
  label: string
  amount: number
}

export interface TaxDetails {
  cgstEnabled: boolean
  sgstEnabled: boolean
  igstEnabled: boolean
  cgstRate: number
  sgstRate: number
  igstRate: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
}

/**
 * Bank Details Interface
 * NOTE: Bank details are now fixed and should use ENVIROCARE_BANK_DETAILS constant
 * This interface is kept for backward compatibility
 */
export interface BankDetails {
  accountName: string
  accountNumber: string
  ifsc: string
  bankNameBranch: string
  accountType: string
}

export interface QuotationDraft {
  quotationNo: string
  date: string
  customerId?: string
  vendorId?: string
  // Summary row displayed above items
  scopeOfService?: string
  sampleDescription?: string
  minimumQuantityRequired?: string
  billTo: Address
  shipTo: Address
  contact: ContactPerson
  items: QuotationItem[]
  additionalCharges: AdditionalCharge[]
  subtotal: number
  taxes: TaxDetails
  grandTotal: number
  amountInWords?: string
  preparedBy: {
    name: string
    phone?: string
    email?: string
  }
  bankDetails: BankDetails
  terms: string
  status?: QuotationStatus
  attachments?: {
    rateList?: File
  }
}

export interface SavedQuotation {
  id: string
  quotationNo: string
  date: string
  customerName: string
  contactPerson: string
  totalAmount: number
  status: QuotationStatus
  createdAt: string
  lastModified: string
  createdByName?: string // Name of the user who created this quotation
  fullData?: QuotationDraft // Store complete quotation data for editing
}

export interface ValidationErrors {
  [key: string]: string | ValidationErrors
}

