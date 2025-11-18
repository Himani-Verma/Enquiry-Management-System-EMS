'use client'

import { useState } from 'react'
import { Edit, Trash2, Download } from 'lucide-react'
import { SavedQuotation, QuotationStatus } from '@/lib/types/quotation'

interface QuotationTableProps {
 quotations: SavedQuotation[]
 onEdit: (id: string) => void
 onDelete: (id: string) => void
 onPreview: (quotation: any) => void
 onDownload: (id: string) => void
 onStatusChange?: (id: string, newStatus: QuotationStatus) => void
 userRole?: 'admin' | 'executive' | 'sales-executive' | 'customer-executive'
 currentUser?: { name: string; username: string; id: string; role: string }
}

const getStatusColor = (status: QuotationStatus) => {
 switch (status) {
 case 'draft':
 return 'bg-gray-600 text-gray-200'
 case 'sent':
 return 'bg-blue-600 text-blue-100'
 case 'approved':
 return 'bg-green-600 text-green-100'
 case 'rejected':
 return 'bg-red-600 text-red-100'
 case 'expired':
 return 'bg-orange-600 text-orange-100'
 default:
 return 'bg-gray-600 text-gray-200'
 }
}

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
 month: 'short',
 year: 'numeric'
 })
}

export default function QuotationTable({ 
 quotations, 
 onEdit, 
 onDelete, 
 onPreview,
 onDownload,
 onStatusChange,
 userRole = 'admin',
 currentUser
}: QuotationTableProps) {
 const [sortField, setSortField] = useState<keyof SavedQuotation>('date')
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

 // Check if current user can edit the quotation status
 const canEditStatus = (quotation: SavedQuotation) => {
 if (!currentUser) return false
 
 // Admin can edit all quotations
 if (currentUser.role === 'admin') return true
 
 // Check if current user is the creator
 const createdByName = quotation.createdByName || ''
 return createdByName === currentUser.name || createdByName === currentUser.username
 }

 const handleSort = (field: keyof SavedQuotation) => {
 if (sortField === field) {
 setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
 } else {
 setSortField(field)
 setSortDirection('asc')
 }
 }

 const sortedQuotations = [...quotations].sort((a, b) => {
 const aValue = a[sortField]
 const bValue = b[sortField]
 
 if (typeof aValue === 'string' && typeof bValue === 'string') {
 return sortDirection === 'asc' 
 ? aValue.localeCompare(bValue)
 : bValue.localeCompare(aValue)
 }
 
 if (typeof aValue === 'number' && typeof bValue === 'number') {
 return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
 }
 
 return 0
 })

 return (
 <div className="overflow-hidden">
 <div className="overflow-x-auto rounded-lg border border-gray-200">
 <table className="w-full">
 <thead className="bg-gray-50">
 <tr className="border-b-2 border-gray-200">
 <th 
 className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors text-gray-700"
 onClick={() => handleSort('quotationNo')}
 >
 <div className="flex items-center gap-2">
 Quotation #
 {sortField === 'quotationNo' && (
 <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
 )}
 </div>
 </th>
 <th 
 className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors text-gray-700"
 onClick={() => handleSort('customerName')}
 >
 <div className="flex items-center gap-2">
 Customer
 {sortField === 'customerName' && (
 <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
 )}
 </div>
 </th>
 <th 
 className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors text-gray-700"
 onClick={() => handleSort('date')}
 >
 <div className="flex items-center gap-2">
 Date
 {sortField === 'date' && (
 <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
 )}
 </div>
 </th>
 <th className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-700">
 Created By
 </th>
 <th 
 className="text-right py-4 px-6 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors text-gray-700"
 onClick={() => handleSort('totalAmount')}
 >
 <div className="flex items-center justify-end gap-2">
 Amount
 {sortField === 'totalAmount' && (
 <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
 )}
 </div>
 </th>
 <th 
 className="text-left py-4 px-6 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors text-gray-700"
 onClick={() => handleSort('status')}
 >
 <div className="flex items-center gap-2">
 Status
 {sortField === 'status' && (
 <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
 )}
 </div>
 </th>
 <th className="text-center py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-700">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200 bg-white">
 {sortedQuotations.map((quotation, index) => (
 <tr 
 key={quotation.id} 
 className="hover:bg-blue-50 transition-all duration-200 group hover:shadow-sm border-l-4 border-transparent hover:border-blue-500"
 >
 <td className="py-4 px-6">
 <div className="flex items-center gap-2">
 <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
 {index + 1}
 </span>
 <span className="font-semibold text-gray-900">
 {quotation.quotationNo}
 </span>
 </div>
 </td>
 <td className="py-4 px-6">
 <div className="flex flex-col">
 <span className="font-medium text-gray-900">
 {quotation.customerName}
 </span>
 <span className="text-xs text-gray-800 mt-1">
 {quotation.contactPerson}
 </span>
 </div>
 </td>
 <td className="py-4 px-6">
 <span className="text-sm text-gray-700">
 {formatDate(quotation.date)}
 </span>
 </td>
 <td className="py-4 px-6">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
 {quotation.createdByName ? quotation.createdByName.charAt(0).toUpperCase() : 'U'}
 </div>
 <span className="text-sm text-gray-700 font-medium">
 {quotation.createdByName || 'Unknown'}
 </span>
 </div>
 </td>
 <td className="py-4 px-6 text-right">
 <span className="font-bold text-gray-900 text-lg">
 {formatCurrency(quotation.totalAmount)}
 </span>
 </td>
 <td className="py-4 px-6">
 {canEditStatus(quotation) ? (
 <select
 value={quotation.status}
 onChange={(e) => {
 const newStatus = e.target.value as QuotationStatus
 if (onStatusChange) {
 onStatusChange(quotation.id, newStatus)
 }
 }}
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:opacity-80 ${getStatusColor(quotation.status)}`}
 style={{ minWidth: '100px' }}
 >
 <option value="draft">Draft</option>
 <option value="sent">Sent</option>
 <option value="approved">Approved</option>
 <option value="rejected">Rejected</option>
 <option value="expired">Expired</option>
 </select>
 ) : (
 <span
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(quotation.status)}`}
 style={{ minWidth: '100px', display: 'inline-block', textAlign: 'center' }}
 title="Only the creator can edit the status"
 >
 {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
 </span>
 )}
 </td>
 <td className="py-4 px-6">
 <div className="flex items-center justify-center gap-1">
 <button
 onClick={() => onEdit(quotation.id)}
 className="p-2 rounded-lg hover:bg-green-100 transition-all text-gray-900 hover:text-green-600 hover:scale-110 relative group/btn"
 title="Edit Quotation"
 aria-label="Edit quotation"
 >
 <Edit className="w-4 h-4" />
 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
 Edit
 </span>
 </button>
 <button
 onClick={() => onDownload(quotation.id)}
 className="p-2 rounded-lg hover:bg-blue-100 transition-all text-gray-900 hover:text-blue-600 hover:scale-110 relative group/btn"
 title="Download Quotation"
 aria-label="Download quotation"
 >
 <Download className="w-4 h-4" />
 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
 Download
 </span>
 </button>
 <button
 onClick={() => onDelete(quotation.id)}
 className="p-2 rounded-lg hover:bg-red-100 transition-all text-gray-900 hover:text-red-600 hover:scale-110 relative group/btn"
 title="Delete Quotation"
 aria-label="Delete quotation"
 >
 <Trash2 className="w-4 h-4" />
 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
 Delete
 </span>
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 
 {quotations.length === 0 && (
 <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
 <div className="text-6xl mb-4">📄</div>
 <h3 className="text-xl font-bold mb-2 text-gray-800">
 No quotations found
 </h3>
 <p className="text-sm text-gray-900">
 Click the "Generate Quotation" button above to create your first quotation
 </p>
 </div>
 )}
 </div>
 )
}
