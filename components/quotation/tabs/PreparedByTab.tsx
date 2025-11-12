'use client'

import { useFormContext } from 'react-hook-form'
import { User, Building, CreditCard } from 'lucide-react'
import { QuotationDraft, ValidationErrors } from '@/lib/types/quotation'

interface PreparedByTabProps {
 form: any
 errors: ValidationErrors
 mode: 'create' | 'edit' | 'view'
}

export default function PreparedByTab({ 
 form, 
 errors, 
 mode 
}: PreparedByTabProps) {
 const { register, watch } = form
 const watchedValues = watch()
 const isReadOnly = mode === 'view'

 return (
 <div className="space-y-6">
 {/* Prepared By Section */}
 <div className="space-y-4">
 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2" >
 <User className="w-5 h-5" />
 Prepared By
 </h3>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold mb-2 text-gray-800" >
 Name *
 </label>
 <input
 {...register('preparedBy.name', { required: 'Prepared by name is required' })}
 disabled={isReadOnly}
 className={`w-full px-3 py-2 rounded-lg border transition-colors ${
 errors.preparedByName 
 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
 : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
 }`}
 placeholder="Enter prepared by name"
 />
 {errors.preparedByName && (
 <p className="mt-1 text-sm text-red-600">
 {typeof errors.preparedByName === 'string' ? errors.preparedByName : ''}
 </p>
 )}
 </div>

 <div>
 <label className="block text-sm font-bold mb-2 text-gray-800" >
 Phone
 </label>
 <input
 {...register('preparedBy.phone')}
 disabled={isReadOnly}
 className="w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
 placeholder="Enter phone number"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold mb-2 text-gray-800" >
 Email
 </label>
 <input
 type="email"
 {...register('preparedBy.email')}
 disabled={isReadOnly}
 className="w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
 placeholder="Enter email address"
 />
 </div>
 </div>

 {/* Bank Details Section - FIXED AND UNCHANGEABLE */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
 <CreditCard className="w-5 h-5" />
 Envirocare Labs Bank Details
 </h3>
 <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
 Fixed - Cannot be changed
 </span>
 </div>

 <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
 <p className="text-sm text-blue-800 mb-3 font-medium">
 ℹ️ These bank details are fixed for all quotations and cannot be modified.
 </p>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-bold mb-2 text-gray-800">
 A/c Type
 </label>
 <input
 {...register('bankDetails.accountType')}
 disabled={true}
 className="w-full px-4 py-3 rounded-lg border-2 bg-gray-100 text-gray-700 font-medium cursor-not-allowed"
 readOnly
 />
 </div>

 <div>
 <label className="block text-sm font-bold mb-2 text-gray-800">
 Account Name
 </label>
 <input
 {...register('bankDetails.accountName')}
 disabled={true}
 className="w-full px-4 py-3 rounded-lg border-2 bg-gray-100 text-gray-700 font-medium cursor-not-allowed"
 readOnly
 />
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
 <div>
 <label className="block text-sm font-bold mb-2 text-gray-800">
 Account Number
 </label>
 <input
 {...register('bankDetails.accountNumber')}
 disabled={true}
 className="w-full px-4 py-3 rounded-lg border-2 bg-gray-100 text-gray-700 font-medium cursor-not-allowed"
 readOnly
 />
 </div>

 <div>
 <label className="block text-sm font-bold mb-2 text-gray-800">
 IFSC Code
 </label>
 <input
 {...register('bankDetails.ifsc')}
 disabled={true}
 className="w-full px-4 py-3 rounded-lg border-2 bg-gray-100 text-gray-700 font-medium cursor-not-allowed"
 readOnly
 />
 </div>
 </div>

 <div className="mt-4">
 <label className="block text-sm font-bold mb-2 text-gray-800">
 Bank Name & Branch
 </label>
 <input
 {...register('bankDetails.bankNameBranch')}
 disabled={true}
 className="w-full px-4 py-3 rounded-lg border-2 bg-gray-100 text-gray-700 font-medium cursor-not-allowed"
 readOnly
 />
 </div>
 </div>
 </div>
 </div>
 )
}