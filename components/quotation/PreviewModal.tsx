'use client'

import { QuotationDraft } from '@/lib/types/quotation'
import { X, Printer, Download } from 'lucide-react'
import { useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'


interface PreviewModalProps {
 isOpen: boolean
 quotation?: QuotationDraft
 onClose: () => void
}

export default function PreviewModal({ isOpen, quotation, onClose }: PreviewModalProps) {
 const printRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (isOpen) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = '';
 }
 return () => {
 document.body.style.overflow = '';
 };
 }, [isOpen]);

 if (!isOpen || !quotation) return null

 const formatCurrency = (amount: number) => {
 return new Intl.NumberFormat('en-IN', {
 style: 'currency',
 currency: 'INR',
 minimumFractionDigits: 2,
 maximumFractionDigits: 2,
 }).format(amount);
 };

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString('en-IN', {
 day: '2-digit',
 month: 'short',
 year: '2-digit'
 });
 };

 const numberToWords = (num: number): string => {
 if (num === 0) return 'Zero Rupees Only';
 const integerPart = Math.floor(num);
 const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(integerPart);
 return `${rupees.replace('₹', '').trim()} Only`;
 };

 const handleDownloadPDF = async () => {
 if (!printRef.current) return;

 try {
 // Create a temporary container for PDF generation
 const tempContainer = document.createElement('div');
 tempContainer.style.position = 'absolute';
 tempContainer.style.left = '-9999px';
 tempContainer.style.top = '-9999px';
 tempContainer.style.width = '210mm';
 tempContainer.style.backgroundColor = 'white';
 tempContainer.style.padding = '15mm'; // Reduced padding to fit on 1 page
 tempContainer.style.transform = 'scale(0.95)'; // Slight scale to fit
 tempContainer.style.transformOrigin = 'top left';
 tempContainer.innerHTML = printRef.current.innerHTML;
 document.body.appendChild(tempContainer);

 // Generate canvas from the content
 const canvas = await html2canvas(
 tempContainer,
 {
 scale: 2,
 useCORS: true,
 allowTaint: true,
 backgroundColor: '#ffffff',
 } as any
 );

 // Remove temporary container
 document.body.removeChild(tempContainer);

 // Create PDF - fit to single page
 const imgData = canvas.toDataURL('image/png');
 const pdf = new jsPDF('p', 'mm', 'a4');
 
 const pdfWidth = 210;
 const pdfHeight = 297;
 const imgWidth = pdfWidth;
 const imgHeight = (canvas.height * imgWidth) / canvas.width;
 
 // Scale to fit on one page if needed
 if (imgHeight > pdfHeight) {
 const scale = pdfHeight / imgHeight;
 const scaledWidth = imgWidth * scale;
 const scaledHeight = pdfHeight;
 const xOffset = (pdfWidth - scaledWidth) / 2;
 pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
 } else {
 pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
 }

 // Download the PDF
 pdf.save(`quotation-${quotation.quotationNo}.pdf`);
 } catch (error) {
 console.error('Error generating PDF:', error);
 alert('Error generating PDF. Please try again.');
 }
 };



 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
 <div
 className="relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-2xl shadow-xl"
 style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text)' }}
 >
 {/* Modal Header */}
 <div
 className="flex items-center justify-between p-6 border-b"
 style={{ borderColor: 'var(--border)' }}
 >
 <h2 className="text-xl font-semibold">
 Quotation Preview
 </h2>
 <div className="flex items-center gap-3">
 <button
 onClick={handleDownloadPDF}
 className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
 >
 <Download className="w-4 h-4" /> PDF
 </button>

 <button
 onClick={() => window.print()}
 className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
 style={{ color: 'var(--text-gray-900)', backgroundColor: 'var(--surface-1)' }}
 >
 <Printer className="w-4 h-4" /> Print
 </button>
 <button
 onClick={onClose}
 className="p-2 rounded-full hover:bg-gray-100"
 style={{ color: 'var(--text-gray-900)' }}
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Content - A4 Print Layout */}
 <div className="flex-1 overflow-y-auto p-6">
 <div 
 ref={printRef}
 className="bg-white mx-auto shadow-lg"
 style={{ 
 width: '210mm',
 minHeight: '297mm',
 padding: '12mm',
 fontSize: '11px'
 }}
 >
 {/* Company Header - Exact match to reference */}
 <div className="flex items-start justify-between mb-8">
 <div className="flex-1">
 <div className="flex items-start gap-4 mb-4">
 <div 
 className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
 style={{ backgroundColor: '#64aa53' }}
 >
 E
 </div>
 <div>
 <h1 className="text-xl font-bold mb-1" style={{ color: '#2d4891' }}>
 Envirocare Labs Private Limited
 </h1>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 Enviro House, A8/A7, MIDC Main Road,<br />
 Wagle Industrial Estate, Thane<br />
 Maharashtra- 400604<br />
 <span className="text-blue-600 underline">www.envirocarelabs.com</span>
 </p>
 </div>
 </div>
 </div>
 
 <div className="text-right">
 <div 
 className="inline-block px-4 py-2 rounded text-white text-sm font-medium mb-4"
 style={{ backgroundColor: '#2d4891' }}
 >
 <div className="font-bold">Our Services</div>
 <div>Food Testing</div>
 <div>Water Testing</div>
 <div>Air Monitoring</div>
 <div>Suvery & Inspections</div>
 </div>
 <div className="space-y-1 text-sm">
 <p><strong>Date:</strong> {formatDate(quotation.date)}</p>
 <p><strong>Quotation #:</strong> {quotation.quotationNo}</p>
 <p><strong>Customer ID:</strong> {quotation.customerId || 'NA'}</p>
 <p><strong>Vendor ID:</strong> {quotation.vendorId || 'NA'}</p>
 </div>
 </div>
 </div>

 {/* Bill To & Ship To - Exact layout from reference */}
 <div className="mb-6">
 <div 
 className="flex items-center justify-between p-3 text-white font-bold"
 style={{ backgroundColor: '#2d4891' }}
 >
 <span>Bill to</span>
 <span>Ship to</span>
 </div>
 
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 border border-gray-300">
 <div>
 <p className="font-medium mb-2" style={{ color: '#333' }}>
 {quotation.billTo.name}
 </p>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 {quotation.billTo.address1}
 </p>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 {quotation.billTo.address2}
 </p>
 <p className="text-sm mb-2" style={{ color: '#666' }}>
 {quotation.billTo.city}
 </p>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 <strong>Contact Person:</strong> {quotation.contact.name}
 </p>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 <strong>Tel:</strong> {quotation.contact.phone}
 </p>
 <p className="text-sm" style={{ color: '#666' }}>
 <strong>Email:</strong> {quotation.contact.email}
 </p>
 </div>

 <div>
 <p className="font-medium mb-2" style={{ color: '#333' }}>
 {quotation.shipTo.name || quotation.billTo.name}
 </p>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 {quotation.shipTo.address1 || quotation.billTo.address1}
 </p>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 {quotation.shipTo.address2 || quotation.billTo.address2}
 </p>
 <p className="text-sm mb-2" style={{ color: '#666' }}>
 {quotation.shipTo.city || quotation.billTo.city}
 </p>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 <strong>Contact Person:</strong> {quotation.contact.name}
 </p>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 <strong>Tel:</strong> {quotation.contact.phone}
 </p>
 <p className="text-sm" style={{ color: '#666' }}>
 <strong>Email:</strong> {quotation.contact.email}
 </p>
 </div>
 </div>
 </div>

 {/* Scope of Service / Sample Details - Exact table structure */}
 <div className="mb-6">
 <div 
 className="flex items-center justify-between p-2 text-white font-bold leading-tight"
 style={{ backgroundColor: '#2d4891', fontSize: '11px' }}
 >
 <div className="flex items-center gap-3">
 <span>Scope of Service</span>
 <span className="text-xs">Food</span>
 </div>
 <div className="flex items-center gap-3">
 <span>Sample Description</span>
 <span className="text-xs">Raw Food</span>
 </div>
 <div>
 <span className="text-xs">Minimum Quantity Required</span>
 </div>
 </div>
 
 <div className="overflow-x-auto">
 <table className="w-full border-collapse">
 <thead>
 <tr className="border-b-2" style={{ borderColor: '#2d4891' }}>
 <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 S.No
 </th>
 <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 Sample Name
 </th>
 <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 Test Parameters
 </th>
 <th className="text-center py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 No Of Samples
 </th>
 <th className="text-center py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 Unit Price (INR)
 </th>
 <th className="text-center py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 Total Price (INR)
 </th>
 </tr>
 </thead>
 <tbody>
 {quotation.items.map((item, index) => (
 <tr key={item.id} className="border-b" style={{ borderColor: '#e5e7eb' }}>
 <td className="py-3 px-4 text-sm text-center" style={{ color: '#333' }}>
 {item.sNo}
 </td>
 <td className="py-3 px-4 text-sm font-medium" style={{ color: '#333' }}>
 {item.sampleName}
 </td>
 <td className="py-3 px-4 text-sm" style={{ color: '#666' }}>
 {item.description}
 </td>
 <td className="py-3 px-4 text-sm text-center" style={{ color: '#333' }}>
 {item.quantity}
 </td>
 <td className="py-3 px-4 text-sm text-center" style={{ color: '#333' }}>
 {formatCurrency(item.unitPrice)}
 </td>
 <td className="py-3 px-4 text-sm text-center font-medium" style={{ color: '#333' }}>
 {formatCurrency(item.total)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Additional Charges (Sampling) - Exact match */}
 {quotation.additionalCharges.length > 0 && (
 <div className="mt-4">
 <table className="w-full border-collapse">
 <tbody>
 {quotation.additionalCharges.map((charge) => (
 <tr key={charge.id} className="border-b" style={{ borderColor: '#e5e7eb' }}>
 <td className="py-3 px-4 text-sm text-center" style={{ color: '#333' }}>
 -
 </td>
 <td className="py-3 px-4 text-sm font-medium" style={{ color: '#333' }}>
 {charge.label}
 </td>
 <td className="py-3 px-4 text-sm" style={{ color: '#666' }}>
 -
 </td>
 <td className="py-3 px-4 text-sm text-center" style={{ color: '#333' }}>
 -
 </td>
 <td className="py-3 px-4 text-sm text-center" style={{ color: '#333' }}>
 {formatCurrency(charge.amount)}
 </td>
 <td className="py-3 px-4 text-sm text-center font-medium" style={{ color: '#333' }}>
 {formatCurrency(charge.amount)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Summary - Exact match to reference */}
 <div className="mb-6">
 <div className="flex justify-between">
 <div>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 <strong>Quotation Prepared by:</strong> {quotation.preparedBy.name}
 </p>
 <p className="text-sm mb-1" style={{ color: '#666' }}>
 <strong>Contact No:</strong> {quotation.preparedBy.phone}
 </p>
 <p className="text-sm" style={{ color: '#666' }}>
 <strong>Email ID:</strong> {quotation.preparedBy.email}
 </p>
 </div>
 
 <div className="text-right">
 <div className="space-y-1 text-sm">
 <div className="flex justify-between">
 <span style={{ color: '#666' }}>Total Charges ₹</span>
 <span style={{ color: '#333' }}>{quotation.subtotal.toLocaleString('en-IN')}</span>
 </div>
 <div className="flex justify-between">
 <span style={{ color: '#666' }}>SGST {quotation.taxes.sgstRate}% ₹</span>
 <span style={{ color: '#333' }}>{quotation.taxes.sgstAmount.toLocaleString('en-IN')}</span>
 </div>
 <div className="flex justify-between">
 <span style={{ color: '#666' }}>CGST {quotation.taxes.cgstRate}% ₹</span>
 <span style={{ color: '#333' }}>{quotation.taxes.cgstAmount.toLocaleString('en-IN')}</span>
 </div>
 <div className="flex justify-between border-t-2 pt-2" style={{ borderColor: '#2d4891' }}>
 <span className="font-bold" style={{ color: '#333' }}>Grand Total ₹</span>
 <span className="font-bold text-lg" style={{ color: '#2d4891' }}>
 {quotation.grandTotal.toLocaleString('en-IN')}.00
 </span>
 </div>
 </div>
 </div>
 </div>
 
 {/* Amount in Words */}
 <div className="mt-4">
 <p className="text-sm font-bold" style={{ color: '#333' }}>
 Amount (Words): {numberToWords(Math.floor(quotation.grandTotal))} Rupees Only.
 </p>
 </div>
 </div>

 {/* Bank Details - Exact match to Excel reference */}
 <div className="mb-6">
 <div 
 className="p-2 text-white font-bold leading-tight"
 style={{ backgroundColor: '#2d4891', fontSize: '12px' }}
 >
 Envirocare Labs Bank Details
 </div>
 <div className="border border-gray-300">
 <table className="w-full">
 <thead>
 <tr className="border-b" style={{ borderColor: '#2d4891' }}>
 <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 A/c Type
 </th>
 <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 Account Name
 </th>
 <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 Account Number
 </th>
 <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 Bank Name/Branch
 </th>
 <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 IFSC Code
 </th>
 <th className="text-left py-3 px-4 font-bold text-sm" style={{ color: '#2d4891' }}>
 Scan to Pay
 </th>
 </tr>
 </thead>
 <tbody>
 <tr className="border-b" style={{ borderColor: '#e5e7eb' }}>
 <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>
 {quotation.bankDetails.accountType}
 </td>
 <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>
 {quotation.bankDetails.accountName}
 </td>
 <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>
 {quotation.bankDetails.accountNumber}
 </td>
 <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>
 {quotation.bankDetails.bankNameBranch}
 </td>
 <td className="py-3 px-4 text-sm" style={{ color: '#333' }}>
 {quotation.bankDetails.ifsc}
 </td>
 <td className="py-3 px-4 text-sm" style={{ color: '#333' }}></td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 {/* Terms & Conditions - Exact match */}
 <div className="mb-6">
 <h3 className="font-bold mb-4 leading-tight" style={{ color: '#2d4891', fontSize: '13px' }}>
 General Terms & Conditions (Detailed Terms & Conditions visit{' '}
 <a 
 href="https://envirocarelabs.com/terms-conditions" 
 target="_blank" 
 rel="noopener noreferrer"
 className="text-blue-600 hover:underline"
 style={{ fontSize: '12px' }}
 >
 https://envirocarelabs.com/terms-conditions
 </a>
 )
 </h3>
 <div className="border border-gray-300 p-4 text-sm" style={{ color: '#666' }}>
 <div className="whitespace-pre-wrap">{quotation.terms}</div>
 </div>
 </div>

 {/* Footer */}
 <div className="flex justify-between items-end mt-12 text-sm" style={{ color: '#333' }}>
 <div className="text-center">
 <p className="border-t border-gray-400 pt-2 font-medium">
 Authorised Signatory
 </p>
 </div>
 <div className="text-center">
 <p className="border-t border-gray-400 pt-2 font-medium">
 Customer Signature
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}