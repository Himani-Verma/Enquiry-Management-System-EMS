'use client'

import { useFormContext } from 'react-hook-form'
import { Calculator, Percent } from 'lucide-react'
import { QuotationDraft, ValidationErrors } from '@/lib/types/quotation'
import { formatINR } from '@/lib/quotation-calculations'

interface TaxesSummaryTabProps {
 form: any
 errors: ValidationErrors
 mode: 'create' | 'edit' | 'view'
}

export default function TaxesSummaryTab({ 
 form, 
 errors, 
 mode 
}: TaxesSummaryTabProps) {
 const { register, watch, setValue } = form
 const watchedValues = watch()
 const isReadOnly = mode === 'view'
 const cgstEnabled = watchedValues.taxes?.cgstEnabled ?? true
 const sgstEnabled = watchedValues.taxes?.sgstEnabled ?? true
 const igstEnabled = watchedValues.taxes?.igstEnabled ?? false

 return (
 <div className="space-y-6">
 {/* Summary Section */}
 <div className="space-y-4">
 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2" >
 <Calculator className="w-5 h-5" />
 Summary
 </h3>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Left Column - Tax Selection & Rates */}
 <div className="space-y-4">
 {/* Tax Selection with Checkboxes */}
 <div>
 <label className="block text-sm font-bold mb-3 text-gray-800">
 Select Applicable Taxes
 </label>
 <div className="space-y-2">
 {/* CGST Checkbox */}
 <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
 <input
 type="checkbox"
 {...register('taxes.cgstEnabled')}
 disabled={isReadOnly}
 className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
 />
 <div className="flex-1">
 <span className="font-medium text-gray-900">CGST (Central GST)</span>
 <p className="text-xs text-gray-800 mt-0.5">Central Goods and Services Tax</p>
 </div>
 </label>
 
 {/* SGST Checkbox */}
 <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
 <input
 type="checkbox"
 {...register('taxes.sgstEnabled')}
 disabled={isReadOnly}
 className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
 />
 <div className="flex-1">
 <span className="font-medium text-gray-900">SGST (State GST)</span>
 <p className="text-xs text-gray-800 mt-0.5">State Goods and Services Tax</p>
 </div>
 </label>
 
 {/* IGST Checkbox */}
 <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
 <input
 type="checkbox"
 {...register('taxes.igstEnabled')}
 disabled={isReadOnly}
 className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
 />
 <div className="flex-1">
 <span className="font-medium text-gray-900">IGST (Integrated GST)</span>
 <p className="text-xs text-gray-800 mt-0.5">Integrated Goods and Services Tax</p>
 </div>
 </label>
 </div>
 </div>

 {/* Tax Rates */}
 <div className="space-y-3">
 <label className="block text-sm font-bold text-gray-800">
 Tax Rates
 </label>
 
 {/* CGST Rate */}
 {cgstEnabled && (
 <div>
 <label className="block text-xs font-medium mb-1 text-gray-700">
 CGST Rate (%)
 </label>
 <div className="relative">
 <input
 {...register('taxes.cgstRate', { 
 min: { value: 0, message: 'Rate must be non-negative' },
 max: { value: 100, message: 'Rate cannot exceed 100%' }
 })}
 type="number"
 min="0"
 max="100"
 step="0.01"
 disabled={isReadOnly}
 className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
 placeholder="9.00"
 />
 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
 <Percent className="w-4 h-4 text-gray-700" />
 </div>
 </div>
 </div>
 )}

 {/* SGST Rate */}
 {sgstEnabled && (
 <div>
 <label className="block text-xs font-medium mb-1 text-gray-700">
 SGST Rate (%)
 </label>
 <div className="relative">
 <input
 {...register('taxes.sgstRate', { 
 min: { value: 0, message: 'Rate must be non-negative' },
 max: { value: 100, message: 'Rate cannot exceed 100%' }
 })}
 type="number"
 min="0"
 max="100"
 step="0.01"
 disabled={isReadOnly}
 className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
 placeholder="9.00"
 />
 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
 <Percent className="w-4 h-4 text-gray-700" />
 </div>
 </div>
 </div>
 )}

 {/* IGST Rate */}
 {igstEnabled && (
 <div>
 <label className="block text-xs font-medium mb-1 text-gray-700">
 IGST Rate (%)
 </label>
 <div className="relative">
 <input
 {...register('taxes.igstRate', { 
 min: { value: 0, message: 'Rate must be non-negative' },
 max: { value: 100, message: 'Rate cannot exceed 100%' }
 })}
 type="number"
 min="0"
 max="100"
 step="0.01"
 disabled={isReadOnly}
 className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors"
 placeholder="18.00"
 />
 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
 <Percent className="w-4 h-4 text-gray-700" />
 </div>
 </div>
 </div>
 )}

 {!cgstEnabled && !sgstEnabled && !igstEnabled && (
 <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
 <p className="text-sm text-yellow-800">⚠️ Please select at least one tax type</p>
 </div>
 )}
 </div>
 </div>

 {/* Right Column - Calculated Totals */}
 <div className="space-y-4">
 <div className="bg-gray-50 rounded-lg p-4" style={{ backgroundColor: 'var(--surface-2)' }}>
 <h4 className="font-medium mb-3" >Calculated Totals</h4>
 
 <div className="space-y-2">
 <div className="flex justify-between text-sm">
 <span style={{ color: 'var(--text-gray-900)' }}>Subtotal:</span>
 <span className="font-medium" >
 {formatINR(watchedValues.subtotal || 0)}
 </span>
 </div>
 
 {cgstEnabled && (
 <div className="flex justify-between text-sm">
 <span style={{ color: 'var(--text-gray-900)' }}>CGST ({watchedValues.taxes?.cgstRate || 0}%):</span>
 <span className="font-medium" >
 {formatINR(watchedValues.taxes?.cgstAmount || 0)}
 </span>
 </div>
 )}
 
 {sgstEnabled && (
 <div className="flex justify-between text-sm">
 <span style={{ color: 'var(--text-gray-900)' }}>SGST ({watchedValues.taxes?.sgstRate || 0}%):</span>
 <span className="font-medium" >
 {formatINR(watchedValues.taxes?.sgstAmount || 0)}
 </span>
 </div>
 )}
 
 {igstEnabled && (
 <div className="flex justify-between text-sm">
 <span style={{ color: 'var(--text-gray-900)' }}>IGST ({watchedValues.taxes?.igstRate || 0}%):</span>
 <span className="font-medium" >
 {formatINR(watchedValues.taxes?.igstAmount || 0)}
 </span>
 </div>
 )}
 
 <div className="border-t pt-2" style={{ borderColor: 'var(--border)' }}>
 <div className="flex justify-between text-base font-semibold">
 <span >Grand Total:</span>
 <span className="text-blue-600" style={{ color: 'var(--primary)' }}>
 {formatINR(watchedValues.grandTotal || 0)}
 </span>
 </div>
 </div>
 </div>
 </div>

 {/* Amount in Words */}
 <div>
 <label className="block text-sm font-bold mb-2 text-gray-800" >
 Amount in Words
 </label>
 <div className="p-3 rounded-lg border" style={{ 
 
 borderColor: 'var(--border)',
 color: 'var(--text)'
 }}>
 <p className="text-sm font-medium">
 {watchedValues.amountInWords || 'Amount will be calculated automatically'}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Validation Messages */}
 {errors.subtotal && (
 <div className="p-3 rounded-lg bg-red-50 border border-red-200">
 <p className="text-sm text-red-600">{String((errors.subtotal as any)?.message || "")}</p>
 </div>
 )}
 
 {errors.taxes && typeof errors.taxes === 'string' && (
 <div className="p-3 rounded-lg bg-red-50 border border-red-200">
 <p className="text-sm text-red-600">{errors.taxes}</p>
 </div>
 )}
 </div>
 )
}