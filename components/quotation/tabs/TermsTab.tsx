'use client'

import { useFormContext } from 'react-hook-form'
import { FileText } from 'lucide-react'
import { QuotationDraft, ValidationErrors } from '@/lib/types/quotation'

interface TermsTabProps {
 form: any
 errors: ValidationErrors
 mode: 'create' | 'edit' | 'view'
}

export default function TermsTab({ 
 form, 
 errors, 
 mode 
}: TermsTabProps) {
 const { register, watch } = form
 const watchedValues = watch()
 const isReadOnly = mode === 'view'

 const defaultTerms = `1. Validity: 30 days from the date of this offer. Our LIMS is designed to enhance customer satisfaction and necessitates for collection and / or testing of samples to be carried out only after receipt & punching of a commercially clear purchase order.

2. Payment Terms: Interest will be charged @18 % p.a. on all overdue payment from the ‘due date’ up to and including the date the payment is actually received and realized. For priority
monitoring/testing fast track charges shall be applicable.

3. In case of online payment, customer shall confirm the same with a proper payment advice via email at accounts@envirocare.co.in

4. Since our representative(s) are visiting customer premises for sampling purpose only, statutory deductions on account of ESIC, PF, etc. shall not be applicable to us. For tax deducted at source, customer shall provide to Envirocare Labs Pvt. Ltd. TDS Certificate within 30 days from the date of completion of the

5. If sampling team has to return back without doing sampling due to absence of requisite infrastructure in place or cooperation from customer, the sampling fees is to be paid again.

6. Left over Samples, difficult to dispose in a routine manner and needing extra care and resources for disposal or that involve legal disposal, are billed extra or has to be taken back. Any samples for projects that are canceled or not accepted, are returned to the customer at his own expense. The decision of the laboratory in such cases is final. Storage of left over samples at customer’s request beyond stated retention time laid down by laboratory may be on chargeable basis.

7. The customer may direct laboratory to suspend a portion or all of the work to be performed. In such case, the customer shall remain responsible for all work performed up until the time laboratory became aware of customer's desire to discontinue the services. Any uncompleted analysis will be billed on a prorated basis, as determined by laboratory. All directions by customer to suspend work shall be issued to laboratory in writing. If payment advice does not receive, we will adjust the invoices on the FIFO basis within 2 days from the date of receipt of payment.

8. The customer shall pay for all services performed on their behalf and for all results reported, regardless of any allegation on the part of the customer or customer’s customer that the results
issued by laboratory did not conform.`

 return (
 <div className="space-y-6">
 {/* Terms & Conditions Section */}
 <div className="space-y-4">
 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2" >
 <FileText className="w-5 h-5" />
 Terms & Conditions *
 </h3>

 <div>
 <label className="block text-sm font-bold mb-2 text-gray-800" >
 General Terms & Conditions
 </label>
 <textarea
 {...register('terms', { required: 'Terms and conditions are required' })}
 disabled={isReadOnly}
 rows={12}
 className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
 errors.terms 
 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
 : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
 }`}
 placeholder="Enter terms and conditions..."
 defaultValue={defaultTerms}
 />
 {errors.terms && (
 <p className="mt-1 text-sm text-red-600">{String((errors as any).terms?.message || "")}</p>
 )}
 </div>

 {/* Terms Preview */}
 <div className="mt-4">
 <h4 className="text-sm font-medium mb-2" >
 Preview
 </h4>
 <div className="p-4 rounded-lg border" style={{ 
 backgroundColor: 'var(--surface-2)', 
 borderColor: 'var(--border)',
 color: 'var(--text)'
 }}>
 <div className="text-sm whitespace-pre-line">
 {watchedValues.terms || ''}
 </div>
 </div>
 </div>
 </div>

 {/* Additional Information removed as requested */}

 {/* Validation Messages */}
 {errors.terms && (
 <div className="p-3 rounded-lg bg-red-50 border border-red-200">
 <p className="text-sm text-red-600">{String((errors as any).terms?.message || "")}</p>
 </div>
 )}
 </div>
 )
}