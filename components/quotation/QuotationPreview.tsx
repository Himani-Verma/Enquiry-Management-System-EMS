'use client'

import { QuotationDraft } from '@/lib/types/quotation'
import { formatINR, formatDate, formatContactPerson } from '@/lib/quotation-calculations'
import { ENVIROCARE_BANK_DETAILS } from '@/lib/constants/bankDetails'

// Updated: Single-page PDF with exact reference design
interface QuotationPreviewProps {
 quotation: QuotationDraft
}

export default function QuotationPreview({ quotation }: QuotationPreviewProps) {
 const renderValue = (value: string | number | undefined, fallback = '—') => {
 if (value === undefined || value === null || value === '') return fallback
 return value
 }

 const renderCurrency = (value: number | undefined) => {
 if (value === undefined || value === null) return '—'
 return formatINR(value)
 }

 return (
 <div className="quotation-preview bg-white text-gray-900 max-w-full mx-auto text-[8px] leading-none">
 {/* A4 Print Styles */}
 <style jsx>{`
 @media print {
 .quotation-preview {
 margin: 0 !important;
 padding: 0 !important;
 font-size: 5.5pt !important;
 line-height: 0.9 !important;
 max-width: 100% !important;
 transform: scale(0.78) !important;
 transform-origin: top center !important;
 }
 
 @page {
 size: A4;
 margin: 3mm !important;
 }
 
 * {
 -webkit-print-color-adjust: exact !important;
 print-color-adjust: exact !important;
 margin: 0 !important;
 padding: 0 !important;
 }
 
 .border {
 border-width: 0.25pt !important;
 }
 
 table td, table th {
 padding: 0.2mm 0.5mm !important;
 line-height: 0.9 !important;
 font-size: 5.5pt !important;
 }
 
 .p-1, .px-1, .py-1, .p-0.5 {
 padding: 0.3mm !important;
 }
 
 .compact-section {
 margin: 0 !important;
 padding: 0.2mm !important;
 }
 
 h1, h2, h3 {
 margin: 0 !important;
 padding: 0 !important;
 }
 }
 `}</style>

 {/* Business Header */}
 <div className="grid grid-cols-12 gap-0 border border-black">
 <div className="col-span-2 flex items-center justify-center p-1 border-r border-black">
 <div className="w-14 h-14 flex items-center justify-center text-[6px] text-gray-700">Logo</div>
 </div>
 <div className="col-span-7 p-1 border-r border-black">
 <h1 className="text-[9px] font-bold leading-tight mb-0.5 text-[#2d4891]">Envirocare Labs Private Limited</h1>
 <p className="text-[7px] leading-tight text-black">
 Enviro House, A8/A7, MIDC Main Road,<br />
 Wagle Industrial Estate, Thane<br />
 Maharashtra- 400604
 </p>
 <a href="http://www.envitocarelabs.com" className="text-[7px] text-blue-600">www.envitocarelabs.com</a>
 </div>
 <div className="col-span-3 p-1 border border-[#00C853]">
 <h2 className="text-[8px] font-bold text-center text-[#00C853] pb-0.5 mb-0.5">Our Services</h2>
 <ul className="text-[7px] leading-tight text-center text-black">
 <li>Food Testing</li>
 <li>Water Testing</li>
 <li>Air Monitoring</li>
 <li>Survey & Inspections</li>
 </ul>
 </div>
 </div>

 {/* Bill To / Ship To */}
 <div className="grid grid-cols-12 gap-0 border-x border-b border-black">
 <div className="col-span-4 border-r border-black">
 <div className="bg-[#1976D2] text-white px-1 py-0.5 font-bold text-[8px]">Bill to</div>
 <div className="p-1 text-[7px] leading-tight">
 <p className="font-bold text-black">{renderValue(quotation.billTo.name)}</p>
 {quotation.billTo.address1 && <p className="text-black">{renderValue(quotation.billTo.address1)}</p>}
 {quotation.billTo.address2 && <p className="text-black">{renderValue(quotation.billTo.address2)}</p>}
 <p className="text-black">{[quotation.billTo.city, quotation.billTo.pin].filter(Boolean).join(' - ')}</p>
 {quotation.billTo.state && <p className="text-black">{quotation.billTo.state}, India</p>}
 <div className="mt-1 pt-1 border-t border-gray-300">
 <p className="font-bold text-black">Contact Person: {formatContactPerson(quotation.contact)}</p>
 {quotation.contact.phone && <p className="text-black">Tel: {renderValue(quotation.contact.phone)}</p>}
 {quotation.contact.email && <p className="text-blue-600">Email: {renderValue(quotation.contact.email)}</p>}
 </div>
 </div>
 </div>
 <div className="col-span-4 border-r border-black">
 <div className="bg-[#1976D2] text-white px-1 py-0.5 font-bold text-[8px]">Ship to</div>
 <div className="p-1 text-[7px] leading-tight">
 <p className="font-bold text-black">{renderValue(quotation.shipTo.name)}</p>
 {quotation.shipTo.address1 && <p className="text-black">{renderValue(quotation.shipTo.address1)}</p>}
 {quotation.shipTo.address2 && <p className="text-black">{renderValue(quotation.shipTo.address2)}</p>}
 <p className="text-black">{[quotation.shipTo.city, quotation.shipTo.pin].filter(Boolean).join(' - ')}</p>
 {quotation.shipTo.state && <p className="text-black">{quotation.shipTo.state}, India</p>}
 <div className="mt-1 pt-1 border-t border-gray-300">
 <p className="font-bold text-black">Contact Person: {formatContactPerson(quotation.contact)}</p>
 {quotation.contact.phone && <p className="text-black">Tel: {renderValue(quotation.contact.phone)}</p>}
 {quotation.contact.email && <p className="text-blue-600">Email: {renderValue(quotation.contact.email)}</p>}
 </div>
 </div>
 </div>
 <div className="col-span-4">
 <div className="p-1 text-[7px] leading-tight">
 <div className="flex justify-between text-black"><span className="font-bold">Date</span><span>{formatDate(quotation.date)}</span></div>
 <div className="flex justify-between text-black"><span className="font-bold">Quotation #</span><span>{renderValue(quotation.quotationNo)}</span></div>
 <div className="flex justify-between text-black"><span className="font-bold">Customer ID</span><span>{renderValue(quotation.customerId, 'NA')}</span></div>
 <div className="flex justify-between text-black"><span className="font-bold">Vendor ID</span><span>{renderValue(quotation.vendorId, 'NA')}</span></div>
 </div>
 </div>
 </div>

 {/* Scope of Service Table */}
 <div className="border-x border-b border-black">
 <table className="w-full border-collapse text-[7px]">
 <thead>
 <tr className="bg-[#1976D2] text-white">
 <th className="border-r border-black px-1 py-0.5 text-center font-bold">Scope of Service</th>
 <th className="border-r border-black px-1 py-0.5 text-center font-bold">Sample Description</th>
 <th className="px-1 py-0.5 text-center font-bold">Minimum Quantity Required</th>
 </tr>
 </thead>
 <tbody className="bg-white">
 <tr className="border-t border-black">
 <td className="border-r border-black px-1 py-0.5">{renderValue(quotation.scopeOfService || '')}</td>
 <td className="border-r border-black px-1 py-0.5">{renderValue(quotation.sampleDescription || '')}</td>
 <td className="px-1 py-0.5 text-center">{renderValue(quotation.minimumQuantityRequired || '')}</td>
 </tr>
 </tbody>
 </table>
 </div>

 {/* Detailed Items Table */}
 {quotation.items.length > 0 && (
 <div className="border-x border-b border-black">
 <table className="w-full border-collapse text-[7px]">
 <thead>
 <tr className="bg-[#1976D2] text-white">
 <th className="border-r border-black px-1 py-0.5 text-center font-bold">S.No.</th>
 <th className="border-r border-black px-1 py-0.5 text-center font-bold">Sample Name</th>
 <th className="border-r border-black px-1 py-0.5 text-center font-bold">Test Parameters</th>
 <th className="border-r border-black px-1 py-0.5 text-center font-bold">No Of Samples</th>
 <th className="border-r border-black px-1 py-0.5 text-center font-bold">Unit Price (INR)</th>
 <th className="px-1 py-0.5 text-center font-bold">Total Price (INR)</th>
 </tr>
 </thead>
 <tbody className="bg-white">
 {quotation.items.map((item, index) => (
 <tr key={item.id} className="border-t border-black">
 <td className="border-r border-black px-1 py-0.5 text-center">{index + 1}</td>
 <td className="border-r border-black px-1 py-0.5">{renderValue(item.sampleName)}</td>
 <td className="border-r border-black px-1 py-0.5">{renderValue(item.testParameters)}</td>
 <td className="border-r border-black px-1 py-0.5 text-center">{renderValue(item.noOfSamples)}</td>
 <td className="border-r border-black px-1 py-0.5 text-right">{renderCurrency(item.unitPrice)}</td>
 <td className="px-1 py-0.5 text-right">{renderCurrency(item.total)}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Additional Charges */}
 {quotation.additionalCharges.length > 0 && (
 <div className="p-1 border-x border-b border-black bg-white">
 <h3 className="font-bold text-[8px] mb-0.5">Additional Charges (Sampling):</h3>
 {quotation.additionalCharges.map((charge) => (
 <div key={charge.id} className="flex justify-between text-[7px]">
 <span>{renderValue(charge.label)}</span>
 <span>{renderCurrency(charge.amount)}</span>
 </div>
 ))}
 </div>
 )}

 {/* Financial Summary */}
 <div className="p-1 border-x border-b border-black bg-white">
 <div className="flex justify-end">
 <div className="w-48 border border-black">
 <div className="p-0.5 text-[7px]">
 <div className="flex justify-between border-b border-gray-300 py-0.5"><span>Subtotal:</span><span>{renderCurrency(quotation.subtotal)}</span></div>
 {quotation.taxes.cgstEnabled && <div className="flex justify-between border-b border-gray-300 py-0.5"><span>CGST ({quotation.taxes.cgstRate}%):</span><span>{renderCurrency(quotation.taxes.cgstAmount)}</span></div>}
 {quotation.taxes.sgstEnabled && <div className="flex justify-between border-b border-gray-300 py-0.5"><span>SGST ({quotation.taxes.sgstRate}%):</span><span>{renderCurrency(quotation.taxes.sgstAmount)}</span></div>}
 {quotation.taxes.igstEnabled && <div className="flex justify-between border-b border-gray-300 py-0.5"><span>IGST ({quotation.taxes.igstRate}%):</span><span>{renderCurrency(quotation.taxes.igstAmount)}</span></div>}
 <div className="flex justify-between bg-[#1976D2] text-white px-1 py-0.5 -mx-0.5 -mb-0.5 font-bold text-[8px]">
 <span>Grand Total:</span><span>{renderCurrency(quotation.grandTotal)}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Amount in Words */}
 {quotation.amountInWords && (
 <div className="p-0.5 border-x border-b border-black bg-blue-50 text-[7px]">
 <strong>Amount in Words:</strong> <span className="italic">{renderValue(quotation.amountInWords)}</span>
 </div>
 )}

 {/* Prepared By & Bank Details */}
 <div className="grid grid-cols-2 gap-1 p-0.5 border-x border-b border-black bg-white">
 <div className="bg-gray-50 p-0.5 border border-gray-300">
 <h3 className="font-bold text-[8px] border-b border-[#1976D2] pb-0.5 mb-0.5">Prepared By:</h3>
 <div className="text-[7px] leading-tight">
 <p><strong>Name:</strong> {renderValue(quotation.preparedBy.name)}</p>
 {quotation.preparedBy.phone && <p><strong>Phone:</strong> {renderValue(quotation.preparedBy.phone)}</p>}
 {quotation.preparedBy.email && <p><strong>Email:</strong> {renderValue(quotation.preparedBy.email)}</p>}
 </div>
 </div>
 <div className="bg-blue-50 p-0.5 border border-blue-300">
 <h3 className="font-bold text-[8px] border-b border-[#1976D2] pb-0.5 mb-0.5">Envirocare Labs Bank Details:</h3>
 <div className="text-[7px] leading-tight">
 <p><strong>A/c Type:</strong> {ENVIROCARE_BANK_DETAILS.accountType}</p>
 <p><strong>Account Name:</strong> {ENVIROCARE_BANK_DETAILS.accountName}</p>
 <p><strong>Account Number:</strong> {ENVIROCARE_BANK_DETAILS.accountNumber}</p>
 <p><strong>Bank Name/Branch:</strong> {ENVIROCARE_BANK_DETAILS.bankNameBranch}</p>
 <p><strong>IFSC Code:</strong> {ENVIROCARE_BANK_DETAILS.ifsc}</p>
 </div>
 </div>
 </div>

 {/* Terms & Conditions */}
 <div className="p-0.5 border-x border-b border-black bg-white">
 <h3 className="font-bold text-[8px] border-b border-[#1976D2] pb-0.5 mb-0.5 inline-block">
 General Terms & Conditions (Detailed Terms & Conditions visit: www.envirocarelab.com/terms)
 </h3>
 <div className="text-[7px] leading-tight whitespace-pre-line pl-1 border-l-2 border-blue-300">
{`1. Validity: 30 days from the date of this offer. Our LIMS is designed to enhance customer satisfaction and necessitates for collection and / or testing of samples to be carried out only after receipt & punching of a commercially clear purchase order.

2. Payment Terms: Interest will be charged @18 % p.a. on all overdue payment from the ‘due date’ up to and including the date the payment is actually received and realized. For priority
monitoring/testing fast track charges shall be applicable.

3. In case of online payment, customer shall confirm the same with a proper payment advice via email at accounts@envirocare.co.in

4. Since our representative(s) are visiting customer premises for sampling purpose only, statutory deductions on account of ESIC, PF, etc. shall not be applicable to us. For tax deducted at source, customer shall provide to Envirocare Labs Pvt. Ltd. TDS Certificate within 30 days from the date of completion of the

5. If sampling team has to return back without doing sampling due to absence of requisite infrastructure in place or cooperation from customer, the sampling fees is to be paid again.

6. Left over Samples, difficult to dispose in a routine manner and needing extra care and resources for disposal or that involve legal disposal, are billed extra or has to be taken back. Any samples for projects that are canceled or not accepted, are returned to the customer at his own expense. The decision of the laboratory in such cases is final. Storage of left over samples at customer’s request beyond stated retention time laid down by laboratory may be on chargeable basis.

7. The customer may direct laboratory to suspend a portion or all of the work to be performed. In such case, the customer shall remain responsible for all work performed up until the time laboratory became aware of customer's desire to discontinue the services. Any uncompleted analysis will be billed on a prorated basis, as determined by laboratory. All directions by customer to suspend work shall be issued to laboratory in writing. If payment advice does not receive, we will adjust the invoices on the FIFO basis within 2 days from the date of receipt of payment.

8. The customer shall pay for all services performed on their behalf and for all results reported, regardless of any allegation on the part of the customer or customer’s customer that the results
issued by laboratory did not conform.`}
 </div>
 </div>

 </div>
 )
}
