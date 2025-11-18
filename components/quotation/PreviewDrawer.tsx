'use client'

import { useState, useRef } from 'react'
import { X, Download } from 'lucide-react'
import { QuotationDraft } from '@/lib/types/quotation'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'


interface PreviewDrawerProps {
 isOpen: boolean
 quotation?: QuotationDraft
 onClose: () => void
}

export default function PreviewDrawer({ isOpen, quotation, onClose }: PreviewDrawerProps) {
 const printRef = useRef<HTMLDivElement>(null)

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('en-IN', {
 style: 'currency',
 currency: 'INR',
 minimumFractionDigits: 2
 }).format(amount)
 }

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString('en-IN', {
 day: '2-digit',
 month: 'long',
 year: 'numeric'
 })
 }



 const handleExportPDF = async () => {
 if (!printRef.current) return

 try {
 // Create a temporary container for PDF generation
 const tempContainer = document.createElement('div')
 tempContainer.style.position = 'absolute'
 tempContainer.style.left = '-9999px'
 tempContainer.style.top = '-9999px'
 tempContainer.style.width = '210mm'
 tempContainer.style.backgroundColor = 'white'
 tempContainer.style.padding = '6mm' // Reduced padding to fit on 1 page
 tempContainer.style.transform = 'scale(0.95)' // Slight scale to fit
 tempContainer.style.transformOrigin = 'top left'
 tempContainer.innerHTML = printRef.current.innerHTML
 document.body.appendChild(tempContainer)

 // Generate canvas from the content
 const canvas = await html2canvas(tempContainer, {
 scale: 2,
 useCORS: true,
 allowTaint: true
 })

 // Remove temporary container
 document.body.removeChild(tempContainer)

 // Create PDF - fit to single page
 const imgData = canvas.toDataURL('image/png')
 const pdf = new jsPDF('p', 'mm', 'a4')
 
 const pdfWidth = 210
 const pdfHeight = 297
 const imgWidth = pdfWidth
 const imgHeight = (canvas.height * imgWidth) / canvas.width
 
 // Scale to fit on one page if needed
 if (imgHeight > pdfHeight) {
 const scale = pdfHeight / imgHeight
 const scaledWidth = imgWidth * scale
 const scaledHeight = pdfHeight
 const xOffset = (pdfWidth - scaledWidth) / 2
 pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight)
 } else {
 pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
 }

 // Download the PDF
 pdf.save(`quotation-${quotation?.quotationNo || 'export'}.pdf`)
 } catch (error) {
 console.error('Error generating PDF:', error)
 alert('Error generating PDF. Please try again.')
 }
 }







 if (!isOpen || !quotation) return null

 return (
 <div className="fixed inset-0 z-50 overflow-y-auto">
 <div className="flex min-h-full items-center justify-center p-4">
 <div 
 className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
 onClick={onClose}
 />
 
 <div 
 className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl bg-white"
 >
 {/* Header */}
 <div 
 className="flex items-center justify-between p-6 border-b border-gray-200 bg-white"
 >
 <div>
 <h2 className="text-xl font-semibold text-gray-900">
 Quotation Preview
 </h2>
 <p className="text-sm mt-1 text-gray-900">
 {quotation.quotationNo} - {formatDate(quotation.date)}
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={handleExportPDF}
 className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
 >
 <Download className="w-4 h-4" />
 PDF
 </button>

 <button
 onClick={onClose}
 className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Content */}
 <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50">
 <div 
 ref={printRef}
 className="bg-white mx-auto shadow-lg"
 style={{ minHeight: '297mm', maxWidth: '210mm', padding: '6mm', fontSize: '10px' }}
 >
 {/* Header with Green Border */}
 <div className="border-2 border-green-600 mb-1">
 <div className="flex items-start justify-between p-1.5 bg-gradient-to-r from-green-50 to-white">
 {/* Logo and Company Name */}
 <div className="flex items-center gap-2">
 <div className="flex items-center justify-center">
 <img 
 src="/envirocare-logo.png" 
 alt="Envirocare Labs" 
 className="h-12 w-auto object-contain"
 onError={(e) => {
 e.currentTarget.style.display = 'none'
 }}
 />
 </div>
 {/* Branding text removed per request */}
 </div>

 {/* Company Details */}
 <div className="text-xs text-gray-700 max-w-xs leading-tight">
 <p className="font-bold">Envirocare Labs Private Limited</p>
 <p>Enviro House, A8/A7, MIDC Main Road,</p>
 <p>Wagle Industrial Estate, Thane</p>
 <p>Maharashtra- 400604</p>
 <p className="text-blue-600">www.envirocarelabs.com</p>
 </div>

 {/* Services Box - no green background, just border and green heading */}
 <div className="px-2 py-1 text-xs leading-tight border border-green-600">
 <p className="font-bold mb-0.5 text-green-600">Our Services</p>
 <p className="text-gray-900">Food Testing</p>
 <p className="text-gray-900">Water Testing</p>
 <p className="text-gray-900">Air Monitoring</p>
 <p className="text-gray-900">NABL/FSSAI Inspections</p>
 </div>
 </div>
 </div>

 {/* Bill To, Ship To, and Quotation Details */}
 <div className="grid grid-cols-3 gap-2 mb-2">
 {/* Bill To */}
 <div className="border border-gray-300">
 <div className="bg-blue-100 px-2 py-1 border-b border-gray-300">
 <h3 className="text-sm font-bold text-gray-700">Bill to</h3>
 </div>
 <div className="p-2 text-xs space-y-0.5">
 <p className="font-bold text-black leading-tight">{quotation.billTo.name}</p>
 {quotation.billTo.address1 && <p className="text-black leading-tight">{quotation.billTo.address1}</p>}
 {quotation.billTo.address2 && <p className="text-black leading-tight">{quotation.billTo.address2}</p>}
 <p className="text-black leading-tight">
 {quotation.billTo.city} - {quotation.billTo.pin}
 </p>
 <p className="text-gray-700 leading-tight">{quotation.billTo.state}, India</p>
 {quotation.contact.name && (
 <div className="mt-1.5 pt-1.5 border-t border-gray-200">
 <p className="font-bold leading-tight">Contact Person: {quotation.contact.name}</p>
 {quotation.contact.phone && <p className="leading-tight">Tel: {quotation.contact.phone}</p>}
 {quotation.contact.email && <p className="text-blue-600 leading-tight break-words">{quotation.contact.email}</p>}
 </div>
 )}
 </div>
 </div>

 {/* Ship To */}
 <div className="border border-gray-300">
 <div className="bg-blue-100 px-2 py-1 border-b border-gray-300">
 <h3 className="text-sm font-bold text-gray-700">Ship to</h3>
 </div>
 <div className="p-2 text-xs space-y-0.5">
 <p className="font-bold text-black leading-tight">{quotation.shipTo.name || quotation.billTo.name}</p>
 {quotation.shipTo.address1 && <p className="text-black leading-tight">{quotation.shipTo.address1}</p>}
 {quotation.shipTo.address2 && <p className="text-black leading-tight">{quotation.shipTo.address2}</p>}
 <p className="text-black leading-tight">
 {quotation.shipTo.city || quotation.billTo.city} - {quotation.shipTo.pin || quotation.billTo.pin}
 </p>
 <p className="text-gray-700 leading-tight">{quotation.shipTo.state || quotation.billTo.state}, India</p>
 {quotation.contact.name && (
 <div className="mt-1.5 pt-1.5 border-t border-gray-200">
 <p className="font-bold leading-tight">Contact Person: {quotation.contact.name}</p>
 {quotation.contact.phone && <p className="leading-tight">Tel: {quotation.contact.phone}</p>}
 {quotation.contact.email && <p className="text-blue-600 leading-tight break-words">{quotation.contact.email}</p>}
 </div>
 )}
 </div>
 </div>

 {/* Quotation Details and QR */}
 <div className="border border-gray-300">
 <div className="p-2 text-xs">
 <div className="space-y-0.5">
 <div className="flex justify-between items-start">
 <span className="font-bold">Date</span>
 <span className="text-right">{formatDate(quotation.date)}</span>
 </div>
 <div className="flex justify-between items-start">
 <span className="font-bold">Quotation #:</span>
 <span className="text-blue-600 text-right">{quotation.quotationNo}</span>
 </div>
 <div className="flex justify-between items-start">
 <span className="font-bold">Customer ID:</span>
 <span className="text-right">{quotation.customerId || '345'}</span>
 </div>
 <div className="flex justify-between items-start">
 <span className="font-bold">Vendor ID:</span>
 <span className="text-right">{quotation.vendorId || '437'}</span>
 </div>
 </div>
 <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col items-center">
 <div className="w-16 h-16 border border-gray-400 flex items-center justify-center overflow-hidden bg-white">
 <img 
 src="/nabl-qr.png" 
 alt="NABL Scope QR Code" 
 className="w-full h-full object-contain"
 onError={(e) => {
 e.currentTarget.style.display = 'none'
 const parent = e.currentTarget.parentElement
 if (parent) {
 parent.innerHTML = '<span class="text-xs text-gray-800 text-center px-2">QR Code<br/>NABL Scope</span>'
 }
 }}
 />
 </div>
 <p className="text-xs mt-1 font-bold text-center leading-tight">Scan to Explore NABL Scope</p>
 </div>
 </div>
 </div>
 </div>

 {/* Scope of Service Header */}
 <div className="bg-blue-600 text-white text-center py-1 px-2 text-xs font-bold mb-0 leading-tight">
 Scope of Service
 </div>

 {/* Items Table with Blue Theme */}
 <div className="mb-2">
 <table className="w-full border-collapse border border-gray-400">
 <thead>
 <tr className="bg-blue-600 text-white">
 <th className="border border-white py-1 px-1 text-xs font-bold w-10">S.No</th>
 <th className="border border-white py-1 px-1 text-xs font-bold">Sample Name</th>
 <th className="border border-white py-1 px-1 text-xs font-bold">Test Parameters</th>
 <th className="border border-white py-1 px-1 text-xs font-bold w-16">No Of Samples</th>
 <th className="border border-white py-1 px-1 text-xs font-bold w-20">Unit Price (INR)</th>
 <th className="border border-white py-1 px-1 text-xs font-bold w-24">Total Price (INR)</th>
 </tr>
 </thead>
 <tbody>
 {quotation.items.map((item, index) => (
 <tr key={item.id} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
 <td className="border border-gray-300 py-1 px-1 text-xs text-center">{item.sNo}</td>
 <td className="border border-gray-300 py-1 px-1 text-xs font-medium">{item.sampleName}</td>
 <td className="border border-gray-300 py-1 px-1 text-xs">{item.testParameters || item.description || '-'}</td>
 <td className="border border-gray-300 py-1 px-1 text-xs text-center">{item.noOfSamples}</td>
 <td className="border border-gray-300 py-1 px-1 text-xs text-right">{item.unitPrice.toLocaleString('en-IN')}</td>
 <td className="border border-gray-300 py-1 px-1 text-xs text-right font-medium">{item.total.toLocaleString('en-IN')}</td>
 </tr>
 ))}
 </tbody>
 </table>

 {/* Additional Charges Row */}
 {quotation.additionalCharges.length > 0 && (
 <table className="w-full border-collapse border border-gray-400 mt-1">
 <tbody>
 {quotation.additionalCharges.map((charge) => (
 <tr key={charge.id} className="bg-yellow-50">
 <td className="border border-gray-300 py-1 px-1 text-xs font-bold" colSpan={5}>
 Additional Charges ({charge.label})
 </td>
 <td className="border border-gray-300 py-1 px-1 text-xs text-right font-bold">
 {charge.amount.toLocaleString('en-IN')}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>

 {/* Summary Section */}
 <div className="grid grid-cols-2 gap-2 mb-2">
 {/* Left: Prepared By and Amount in Words */}
 <div className="space-y-1">
 <div className="border border-gray-300 p-1.5">
 <p className="text-xs"><span className="font-bold">Quotation Prepared by:</span></p>
 <p className="text-xs">{quotation.preparedBy.name}</p>
 <p className="text-xs">Contact No: {quotation.preparedBy.phone || 'N/A'}</p>
 <p className="text-xs">Email Id: {quotation.preparedBy.email || 'N/A'}</p>
 </div>
 {quotation.amountInWords && (
 <div className="border border-gray-300 p-1.5">
 <p className="text-xs">
 <span className="font-bold">Amount (Words):</span> <span className="underline">{quotation.amountInWords}</span>
 </p>
 </div>
 )}
 </div>

 {/* Right: Tax Summary */}
 <div>
 <table className="w-full border-collapse border border-gray-400 text-xs">
 <tbody>
 <tr className="bg-blue-50">
 <td className="border border-gray-300 py-1 px-2 font-bold">Total Charges</td>
 <td className="border border-gray-300 py-1 px-2 text-right">{quotation.subtotal.toLocaleString('en-IN')}</td>
 </tr>
 <tr>
 <td className="border border-gray-300 py-1 px-2">SGST {quotation.taxes.sgstRate}%</td>
 <td className="border border-gray-300 py-1 px-2 text-right">{quotation.taxes.sgstAmount.toLocaleString('en-IN')}</td>
 </tr>
 <tr>
 <td className="border border-gray-300 py-1 px-2">CGST {quotation.taxes.cgstRate}%</td>
 <td className="border border-gray-300 py-1 px-2 text-right">{quotation.taxes.cgstAmount.toLocaleString('en-IN')}</td>
 </tr>
 <tr className="bg-green-100">
 <td className="border border-gray-300 py-1 px-2 font-bold">Grand Total</td>
 <td className="border border-gray-300 py-1 px-2 text-right font-bold">{quotation.grandTotal.toLocaleString('en-IN')}</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 {/* Bank Details Section */}
 <div className="border border-gray-400 mb-1">
 <div className="bg-blue-600 text-white text-center py-1 px-2 text-xs font-bold leading-tight">
 Bank Details for Payment
 </div>
 <div className="grid grid-cols-2 gap-0">
 <div className="p-1.5 border-r border-gray-300">
 <table className="w-full text-xs">
 <tbody>
 <tr>
 <td className="py-0.5 font-bold">A/c Type</td>
 <td className="py-0.5">{quotation.bankDetails.accountType || 'Current Account'}</td>
 </tr>
 <tr>
 <td className="py-0.5 font-bold">A/c Name</td>
 <td className="py-0.5">{quotation.bankDetails.accountName}</td>
 </tr>
 <tr>
 <td className="py-0.5 font-bold">Account Number</td>
 <td className="py-0.5">{quotation.bankDetails.accountNumber}</td>
 </tr>
 </tbody>
 </table>
 </div>
 <div className="p-1.5">
 <table className="w-full text-xs">
 <tbody>
 <tr>
 <td className="py-0.5 font-bold">Bank Name &Branch</td>
 <td className="py-0.5">{quotation.bankDetails.bankNameBranch}</td>
 </tr>
 <tr>
 <td className="py-0.5 font-bold">IFSC Code</td>
 <td className="py-0.5">{quotation.bankDetails.ifsc}</td>
 </tr>
 <tr>
 <td className="py-0.5 font-bold">Scan to Pay</td>
 <td className="py-0.5">
 <div className="w-12 h-12 border border-gray-400 flex items-center justify-center overflow-hidden bg-white">
 <img 
 src="/payment-qr.png" 
 alt="Payment QR Code" 
 className="w-full h-full object-contain"
 onError={(e) => {
 e.currentTarget.style.display = 'none'
 const parent = e.currentTarget.parentElement
 if (parent) {
 parent.innerHTML = '<span class="text-xs text-gray-800">QR</span>'
 }
 }}
 />
 </div>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>

 {/* Terms and Conditions */}
 <div className="border border-gray-400">
 <div className="bg-blue-600 text-white text-center py-1 px-2 font-bold leading-tight" style={{ fontSize: '10px' }}>
 General Terms & Conditions (Detailed Terms & Conditions visit: www.envirocarelabs.com/terms)
 </div>
 <div className="p-1.5 text-xs leading-tight whitespace-pre-line">
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
 </div>
 </div>
 </div>
 </div>
 )
}
