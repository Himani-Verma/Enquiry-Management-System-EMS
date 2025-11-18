'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, ChevronRight, ChevronLeft } from 'lucide-react'
import { QuotationDraft, FormStep, ValidationErrors } from '@/lib/types/quotation'
import { computeRowTotal, computeSubtotal, computeTaxes, formatINR, amountToWordsIndian, generateId, generateQuotationNo } from '@/lib/quotation-calculations'
import { ENVIROCARE_BANK_DETAILS } from '@/lib/constants/bankDetails'
import HeaderPartiesTab from './tabs/HeaderPartiesTab'
import ItemsTab from './tabs/ItemsTab'
import TaxesSummaryTab from './tabs/TaxesSummaryTab'
import PreparedByTab from './tabs/PreparedByTab'
import TermsTab from './tabs/TermsTab'


interface QuotationFormModalProps {
 isOpen: boolean
 mode: 'create' | 'edit' | 'view'
 quotationId?: string
 quotationData?: QuotationDraft // Add this to pass existing quotation data
 visitorData?: any // Visitor data for auto-fill
 onSave: (quotation: QuotationDraft) => void
 onClose: () => void

}

// Zod validation schema
const quotationSchema = z.object({
 quotationNo: z.string().min(1, 'Quotation number is required'),
 date: z.string().min(1, 'Date is required'),
 customerId: z.string().optional(),
 vendorId: z.string().optional(),
 scopeOfService: z.string().optional(),
 sampleDescription: z.string().optional(),
 minimumQuantityRequired: z.string().optional(),
 billTo: z.object({
 name: z.string().min(1, 'Bill to name is required'),
 address1: z.string().optional(),
 address2: z.string().optional(),
 city: z.string().optional(),
 state: z.string().optional(),
 pin: z.string().optional(),
 email: z.string().email().optional().or(z.literal('')),
 phone: z.string().optional(),
 }),
 shipTo: z.object({
 name: z.string().optional(),
 address1: z.string().optional(),
 address2: z.string().optional(),
 city: z.string().optional(),
 state: z.string().optional(),
 pin: z.string().optional(),
 email: z.string().email().optional().or(z.literal('')),
 phone: z.string().optional(),
 }),
 contact: z.object({
 salutation: z.enum(['Mr.', 'Ms.', 'Dr.', '']).optional(),
 name: z.string().min(1, 'Contact name is required'),
 phone: z.string().optional(),
 email: z.string().email().optional().or(z.literal('')),
 }),
 items: z.array(z.object({
 id: z.string(),
 sNo: z.number(),
 sampleName: z.string().min(1, 'Sample name is required'),
 testParameters: z.string().optional(),
 noOfSamples: z.number().min(1, 'Number of samples must be at least 1'),
 unitPrice: z.number().min(0, 'Unit price must be non-negative'),
 total: z.number(),
 })).min(1, 'At least one item is required'),
 additionalCharges: z.array(z.object({
 id: z.string(),
 label: z.string().min(1, 'Label is required'),
 amount: z.number().min(0, 'Amount must be non-negative'),
 })),
 subtotal: z.number(),
 taxes: z.object({
 cgstEnabled: z.boolean(),
 sgstEnabled: z.boolean(),
 igstEnabled: z.boolean(),
 cgstRate: z.number().min(0).max(100),
 sgstRate: z.number().min(0).max(100),
 igstRate: z.number().min(0).max(100),
 cgstAmount: z.number(),
 sgstAmount: z.number(),
 igstAmount: z.number(),
 }),
 grandTotal: z.number(),
 amountInWords: z.string().optional(),
 preparedBy: z.object({
 name: z.string().min(1, 'Prepared by name is required'),
 phone: z.string().optional(),
 email: z.string().email().optional().or(z.literal('')),
 }),
 bankDetails: z.object({
 accountName: z.string().min(1, 'Account name is required'),
 accountNumber: z.string().min(1, 'Account number is required'),
 ifsc: z.string().min(1, 'IFSC code is required'),
 bankNameBranch: z.string().min(1, 'Bank name and branch is required'),
 accountType: z.string().min(1, 'Account type is required'),
 micr: z.string().optional(),
 }),
 terms: z.string().min(1, 'Terms and conditions are required'),
 status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired']).optional(),
 attachments: z.object({
 rateListFileName: z.string().optional(),
 }).optional(),
})

const formSteps: { key: FormStep; label: string; description: string }[] = [
 { key: 'header', label: 'Header & Parties', description: 'Customer and vendor details' },
 { key: 'items', label: 'Scope & Items', description: 'Products and services' },
 { key: 'taxes', label: 'Taxes & Summary', description: 'Tax calculations and totals' },
 { key: 'prepared', label: 'Prepared By', description: 'Prepared by and bank details' },
 { key: 'terms', label: 'Terms & Conditions', description: 'Terms and conditions' }
]

const initialQuotation: QuotationDraft = {
 quotationNo: '',
 date: new Date().toISOString().split('T')[0],
 customerId: '',
 vendorId: '',
 billTo: {
 name: '',
 address1: '',
 address2: '',
 city: '',
 state: '',
 pin: '',
 email: '',
 phone: ''
 },
 shipTo: {
 name: '',
 address1: '',
 address2: '',
 city: '',
 state: '',
 pin: '',
 email: '',
 phone: ''
 },
 contact: {
 name: '',
 phone: '',
 email: ''
 },
 scopeOfService: '',
 sampleDescription: '',
 minimumQuantityRequired: '',
 items: [],
 additionalCharges: [],
 subtotal: 0,
 taxes: {
 cgstEnabled: true,
 sgstEnabled: true,
 igstEnabled: false,
 cgstRate: 9,
 sgstRate: 9,
 igstRate: 18,
 cgstAmount: 0,
 sgstAmount: 0,
 igstAmount: 0
 },
 grandTotal: 0,
 amountInWords: '',
 preparedBy: {
 name: '',
 phone: '',
 email: ''
 },
 // Bank details are now fixed and unchangeable - using constant
 bankDetails: {
 accountName: ENVIROCARE_BANK_DETAILS.accountName,
 accountNumber: ENVIROCARE_BANK_DETAILS.accountNumber,
 ifsc: ENVIROCARE_BANK_DETAILS.ifsc,
 bankNameBranch: ENVIROCARE_BANK_DETAILS.bankNameBranch,
 accountType: ENVIROCARE_BANK_DETAILS.accountType
 },
 terms: `1. Validity: 30 days from the date of this offer. Our LIMS is designed to enhance customer satisfaction and necessitates for collection and / or testing of samples to be carried out only after receipt & punching of a commercially clear purchase order.

2. Payment Terms: Interest will be charged @18 % p.a. on all overdue payment from the ‘due date’ up to and including the date the payment is actually received and realized. For priority
monitoring/testing fast track charges shall be applicable.

3. In case of online payment, customer shall confirm the same with a proper payment advice via email at accounts@envirocare.co.in

4. Since our representative(s) are visiting customer premises for sampling purpose only, statutory deductions on account of ESIC, PF, etc. shall not be applicable to us. For tax deducted at source, customer shall provide to Envirocare Labs Pvt. Ltd. TDS Certificate within 30 days from the date of completion of the

5. If sampling team has to return back without doing sampling due to absence of requisite infrastructure in place or cooperation from customer, the sampling fees is to be paid again.

6. Left over Samples, difficult to dispose in a routine manner and needing extra care and resources for disposal or that involve legal disposal, are billed extra or has to be taken back. Any samples for projects that are canceled or not accepted, are returned to the customer at his own expense. The decision of the laboratory in such cases is final. Storage of left over samples at customer’s request beyond stated retention time laid down by laboratory may be on chargeable basis.

7. The customer may direct laboratory to suspend a portion or all of the work to be performed. In such case, the customer shall remain responsible for all work performed up until the time laboratory became aware of customer's desire to discontinue the services. Any uncompleted analysis will be billed on a prorated basis, as determined by laboratory. All directions by customer to suspend work shall be issued to laboratory in writing. If payment advice does not receive, we will adjust the invoices on the FIFO basis within 2 days from the date of receipt of payment.

8. The customer shall pay for all services performed on their behalf and for all results reported, regardless of any allegation on the part of the customer or customer’s customer that the results
issued by laboratory did not conform.`,
 attachments: {}
}

export default function QuotationFormModal({
 isOpen,
 mode,
 quotationId,
 quotationData,
 visitorData,
 onSave,
 onClose,

}: QuotationFormModalProps) {
 const [currentStep, setCurrentStep] = useState<FormStep>('header')


 const form = useForm<QuotationDraft>({
 resolver: zodResolver(quotationSchema) as any,
 defaultValues: initialQuotation,
 mode: 'onChange'
 })

 const { watch, setValue, formState: { errors, isValid } } = form
 const watchedValues = watch()

 // Escape key disabled to prevent accidental data loss
 // Users must click Cancel button to close the form

 // Auto-calculate totals when items or charges change
 useEffect(() => {
 const items = watchedValues.items || []
 const charges = watchedValues.additionalCharges || []
 const cgstEnabled = watchedValues.taxes?.cgstEnabled ?? true
 const sgstEnabled = watchedValues.taxes?.sgstEnabled ?? true
 const igstEnabled = watchedValues.taxes?.igstEnabled ?? false
 const cgstRate = watchedValues.taxes?.cgstRate || 9
 const sgstRate = watchedValues.taxes?.sgstRate || 9
 const igstRate = watchedValues.taxes?.igstRate || 18

 // Update item totals
 const updatedItems = items.map(item => ({
 ...item,
 total: computeRowTotal(item.noOfSamples, item.unitPrice)
 }))
 
 if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
 setValue('items', updatedItems)
 }

 // Calculate subtotal
 const subtotal = computeSubtotal(updatedItems, charges)
 if (subtotal !== watchedValues.subtotal) {
 setValue('subtotal', subtotal)
 }

 // Calculate taxes
 const taxes = computeTaxes(subtotal, cgstEnabled, sgstEnabled, igstEnabled, cgstRate, sgstRate, igstRate)
 if (JSON.stringify(taxes) !== JSON.stringify(watchedValues.taxes)) {
 setValue('taxes', taxes)
 }

 // Calculate grand total
 const grandTotal = subtotal + taxes.cgstAmount + taxes.sgstAmount + taxes.igstAmount
 if (grandTotal !== watchedValues.grandTotal) {
 setValue('grandTotal', grandTotal)
 setValue('amountInWords', amountToWordsIndian(grandTotal))
 }
 }, [watchedValues.items, watchedValues.additionalCharges, watchedValues.taxes?.cgstEnabled, watchedValues.taxes?.sgstEnabled, watchedValues.taxes?.igstEnabled, watchedValues.taxes?.cgstRate, watchedValues.taxes?.sgstRate, watchedValues.taxes?.igstRate, setValue])

 useEffect(() => {
 console.log('🔄 useEffect triggered - isOpen:', isOpen, 'mode:', mode)
 if (isOpen) {
 setCurrentStep('header')
 
 // Generate unique quotation number for new quotations
 if (mode === 'create') {
 const newQuotationData = {
 ...initialQuotation,
 quotationNo: generateQuotationNo()
 }
 
 // Check if there's visitor data prop to auto-fill
 if (visitorData) {
 console.log('✨ Auto-filling from visitor data:', visitorData)
 console.log('📝 Will fill billTo.name with:', visitorData.organization || visitorData.name)
 console.log('📝 Will fill billTo.email with:', visitorData.email)
 console.log('📝 Will fill billTo.phone with:', visitorData.phone)
 
 // Auto-fill form with visitor data
 newQuotationData.billTo = {
 name: visitorData.organization || visitorData.name || '',
 email: visitorData.email || '',
 phone: visitorData.phone || '',
 address1: '',
 address2: '',
 city: '',
 state: visitorData.region || '',
 pin: ''
 }
 
 newQuotationData.shipTo = {
 ...newQuotationData.billTo
 }
 
 newQuotationData.contact = {
 salutation: '',
 name: visitorData.name || '',
 email: visitorData.email || '',
 phone: visitorData.phone || ''
 }
 
 // Store visitor ID for linking
 if (visitorData._id) {
 (newQuotationData as any).visitorId = visitorData._id
 }
 
 console.log('✅ Final newQuotationData.billTo:', newQuotationData.billTo)
 console.log('✅ Final newQuotationData.contact:', newQuotationData.contact)
 } else {
 console.log('ℹ️ No visitor data provided')
 }
 
 console.log('🔄 Calling form.reset with:', newQuotationData)
 form.reset(newQuotationData)
 console.log('✅ form.reset completed')
 } else if (mode === 'edit' || mode === 'view') {
 // For edit/view mode, use the quotation data passed from parent
 if (quotationData) {
 console.log('📄 Loading quotation for editing:', quotationData.quotationNo)
 form.reset(quotationData)
 
 // Explicitly set items to ensure they're properly loaded with correct sample names
 if (quotationData.items && quotationData.items.length > 0) {
 setValue('items', quotationData.items)
 }
 } else {
 console.log('⚠️ No quotation data provided, using default')
 form.reset({ ...initialQuotation, quotationNo: generateQuotationNo() })
 }
 } else {
 form.reset({ ...initialQuotation, quotationNo: generateQuotationNo() })
 }
 

 }
 }, [isOpen, form, mode, quotationId, quotationData, visitorData])

 const handleSave = () => {
 // Save to database with draft status
 const quotationWithStatus = {
 ...watchedValues,
 status: 'draft' as const
 }
 console.log('💾 Saving quotation to database:', quotationWithStatus.quotationNo)
 onSave(quotationWithStatus)
 }

 const handleCancel = () => {
 // Check if form has any data
 const hasData = watchedValues.items.length > 0 || 
 watchedValues.billTo.name !== '' ||
 watchedValues.contact.name !== ''
 
 if (hasData) {
 const confirmClose = window.confirm(
 '⚠️ You have unsaved changes. Are you sure you want to close this form?\n\nAll data will be lost.'
 )
 if (confirmClose) {
 onClose()
 }
 } else {
 onClose()
 }
 }



 const handleNext = () => {
 const stepIndex = formSteps.findIndex(step => step.key === currentStep)
 if (stepIndex < formSteps.length - 1) {
 setCurrentStep(formSteps[stepIndex + 1].key)
 }
 }

 const handlePrevious = () => {
 const stepIndex = formSteps.findIndex(step => step.key === currentStep)
 if (stepIndex > 0) {
 setCurrentStep(formSteps[stepIndex - 1].key)
 }
 }




 const renderStepContent = () => {
 switch (currentStep) {
 case 'header':
 return (
 <HeaderPartiesTab
 form={form}
 errors={errors as any}
 mode={mode}
 />
 )
 case 'items':
 return (
 <ItemsTab
 form={form}
 errors={errors as any}
 mode={mode}
 />
 )
 case 'taxes':
 return (
 <TaxesSummaryTab
 form={form}
 errors={errors as any}
 mode={mode}
 />
 )
 case 'prepared':
 return (
 <PreparedByTab
 form={form}
 errors={errors as any}
 mode={mode}
 />
 )
 case 'terms':
 return (
 <TermsTab
 form={form}
 errors={errors as any}
 mode={mode}
 />
 )
 default:
 return null
 }
 }

 if (!isOpen) return null

 return (
 <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
 <div className="flex min-h-full items-center justify-center p-4">
 <div 
 className="fixed inset-0"
 />
 
 <div className="relative w-full max-w-5xl max-h-[85vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
 {/* Header */}
 <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 border-b border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-lg font-bold text-white">
 {mode === 'create' ? '📝 Generate New Quotation' : 
 mode === 'edit' ? '✏️ Edit Quotation' : '👁️ View Quotation'}
 </h2>
 <p className="text-blue-100 text-xs mt-0.5">
 {formSteps.find(step => step.key === currentStep)?.description}
 </p>
 </div>
 <button
 onClick={handleCancel}
 className="p-1.5 rounded-lg hover:bg-white/20 transition-all text-white"
 title="Close"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Step Navigation */}
 <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
 <div className="flex items-center space-x-1.5 overflow-x-auto">
 {formSteps.map((step, index) => {
 const isActive = step.key === currentStep
 const isCompleted = formSteps.findIndex(s => s.key === currentStep) > index
 
 return (
 <div key={step.key} className="flex items-center">
 <button
 onClick={() => setCurrentStep(step.key)}
 className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
 isActive 
 ? 'bg-blue-600 text-white shadow-md' 
 : isCompleted 
 ? 'bg-green-100 text-green-700 hover:bg-green-200' 
 : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
 }`}
 >
 <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
 isActive 
 ? 'bg-white text-blue-600' 
 : isCompleted 
 ? 'bg-green-600 text-white' 
 : 'bg-gray-200 text-gray-900'
 }`}>
 {isCompleted ? '✓' : index + 1}
 </span>
 <span className="hidden sm:inline">{step.label}</span>
 </button>
 {index < formSteps.length - 1 && (
 <ChevronRight className="w-4 h-4 mx-0.5 text-gray-700" />
 )}
 </div>
 )
 })}
 </div>
 </div>

 {/* Content */}
 <div className="p-4 max-h-[55vh] overflow-y-auto bg-white">
 {renderStepContent()}
 </div>

 {/* Footer */}
 <div className="bg-gray-50 px-4 py-2.5 border-t border-gray-200 flex items-center justify-between gap-2">
 <div className="flex items-center gap-2">
 <button
 onClick={handlePrevious}
 disabled={currentStep === 'header'}
 className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold transition-all hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
 >
 <ChevronLeft className="w-3 h-3" />
 <span>Prev</span>
 </button>
 
 {currentStep !== 'terms' && (
 <button
 onClick={handleNext}
 className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-500 bg-white text-blue-600 text-xs font-semibold transition-all hover:bg-blue-50"
 >
 <span>Next</span>
 <ChevronRight className="w-3 h-3" />
 </button>
 )}
 </div>

 <div className="flex items-center gap-1.5 flex-wrap">
 <button
 onClick={handleCancel}
 className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs font-semibold transition-all hover:bg-gray-100"
 >
 Cancel
 </button>
 
 {mode !== 'view' && (
 <button
 onClick={handleSave}
 className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold transition-all hover:bg-green-700"
 title="Save quotation to database"
 >
 <Save className="w-3 h-3" />
 <span>Save</span>
 </button>
 )}
 

 </div>
 </div>
 </div>
 </div>

 {/* Preview Modal */}

 </div>
 )
}
