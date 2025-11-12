'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { ValidationErrors, QuotationItem as ItemRow, AdditionalCharge } from '@/lib/types/quotation'
import ItemsTable from '../ItemsTable'
import AdditionalChargesList from '../AdditionalChargesList'
import { generateId } from '@/lib/quotation-calculations'

interface ItemsTabProps {
 form: any
 errors: ValidationErrors
 mode: 'create' | 'edit' | 'view'
}

interface RateItem {
 _id: string
 id: number
 group: string
 testParameter: string
 rate: number
}

export default function ItemsTab({ 
 form, 
 errors, 
 mode 
}: ItemsTabProps) {
 const { watch, setValue, register } = form
 const watchedValues = watch()

 // Search state
 const [searchQuery, setSearchQuery] = useState('')
 const [selectedGroup, setSelectedGroup] = useState('')
 const [groups, setGroups] = useState<string[]>([])
 const [searchResults, setSearchResults] = useState<RateItem[]>([])
 const [isSearching, setIsSearching] = useState(false)
 const [showResults, setShowResults] = useState(false)

 // Fetch groups on mount
 useEffect(() => {
 const fetchGroups = async () => {
 try {
 const response = await fetch('/api/rate/groups')
 const data = await response.json()
 if (data.success) {
 setGroups(data.groups || [])
 }
 } catch (error) {
 console.error('Failed to fetch groups:', error)
 }
 }
 fetchGroups()
 }, [])

 // Search with debounce
 useEffect(() => {
 if (searchQuery.trim().length < 2) {
 setSearchResults([])
 setShowResults(false)
 return
 }

 const timeoutId = setTimeout(async () => {
 try {
 setIsSearching(true)
 const params = new URLSearchParams({
 q: searchQuery.trim(),
 limit: '20'
 })
 if (selectedGroup) {
 params.append('group', selectedGroup)
 }

 const response = await fetch(`/api/rate/search?${params}`)
 const data = await response.json()
 
 if (data.success) {
 setSearchResults(data.items || [])
 setShowResults(true)
 }
 } catch (error) {
 console.error('Search failed:', error)
 setSearchResults([])
 } finally {
 setIsSearching(false)
 }
 }, 300)

 return () => clearTimeout(timeoutId)
 }, [searchQuery, selectedGroup])

 const handleItemsChange = (items: ItemRow[]) => {
 setValue('items', items)
 }

 const handleAdditionalChargesChange = (charges: AdditionalCharge[]) => {
 setValue('additionalCharges', charges)
 }

 const addItemFromSearch = (rateItem: RateItem) => {
 const currentItems = watchedValues.items || []
 const newItem: ItemRow = {
 id: generateId(),
 sNo: currentItems.length + 1,
 sampleName: rateItem.group,
 testParameters: rateItem.testParameter,
 noOfSamples: 1,
 unitPrice: parseFloat(String(rateItem.rate)) || 0,
 total: parseFloat(String(rateItem.rate)) || 0
 }
 setValue('items', [...currentItems, newItem])
 
 // Clear search
 setSearchQuery('')
 setSearchResults([])
 setShowResults(false)
 }

 const isReadOnly = mode === 'view'

 return (
 <div className="space-y-6">
 {/* Scope Summary (single-row section shown above items) */}
 <div className="space-y-3">
 <h3 className="text-lg font-bold text-gray-900">Scope Summary</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">Scope of Service</label>
 <input
 type="text"
 disabled={isReadOnly}
 {...register('scopeOfService')}
 placeholder="e.g., Food"
 className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">Sample Description</label>
 <input
 type="text"
 disabled={isReadOnly}
 {...register('sampleDescription')}
 placeholder="e.g., Raw Food"
 className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Quantity Required</label>
 <input
 type="text"
 disabled={isReadOnly}
 {...register('minimumQuantityRequired')}
 placeholder="e.g., 1"
 className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 </div>
 </div>
 </div>

 {/* Items Table */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2" >
 <Plus className="w-5 h-5" />
 Items & Services
 </h3>
 <button
 type="button"
 onClick={() => {
 const currentItems = watchedValues.items || []
 const newItem: ItemRow = {
 id: generateId(),
 sNo: currentItems.length + 1,
 sampleName: '',
 testParameters: '',
 noOfSamples: 1,
 unitPrice: 0,
 total: 0
 }
 setValue('items', [...currentItems, newItem])
 }}
 disabled={isReadOnly}
 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <Plus className="w-4 h-4" />
 Add Item
 </button>
 </div>

 {/* Search Bar */}
 {!isReadOnly && (
 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {/* Group Filter */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Filter by Group
 </label>
 <select
 value={selectedGroup}
 onChange={(e) => setSelectedGroup(e.target.value)}
 className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 >
 <option value="">All Groups</option>
 {groups.map((group) => (
 <option key={group} value={group}>
 {group}
 </option>
 ))}
 </select>
 </div>

 {/* Search Input */}
 <div className="md:col-span-2">
 <label className="block text-xs font-semibold text-gray-700 mb-1">
 Search Test Parameter
 </label>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-700" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Type to search test parameters..."
 className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 />
 {searchQuery && (
 <button
 onClick={() => {
 setSearchQuery('')
 setSearchResults([])
 setShowResults(false)
 }}
 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>
 </div>
 </div>

 {/* Search Results */}
 {isSearching && (
 <div className="mt-3 text-sm text-gray-900 text-center py-2">
 Searching...
 </div>
 )}

 {!isSearching && showResults && searchResults.length > 0 && (
 <div className="mt-3 bg-white rounded-lg border border-gray-300 max-h-64 overflow-y-auto shadow-lg">
 <div className="divide-y divide-gray-200">
 {searchResults.map((item) => (
 <button
 key={item._id}
 type="button"
 onClick={() => addItemFromSearch(item)}
 className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors group"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="font-medium text-gray-900 text-sm group-hover:text-blue-600">
 {item.testParameter}
 </div>
 <div className="text-xs text-gray-800 mt-1">
 Group: {item.group}
 </div>
 </div>
 <div className="flex-shrink-0">
 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
 ₹{item.rate}
 </span>
 </div>
 </div>
 </button>
 ))}
 </div>
 </div>
 )}

 {!isSearching && showResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
 <div className="mt-3 text-sm text-gray-800 text-center py-2 bg-white rounded-lg border border-gray-200">
 No results found for &quot;{searchQuery}&quot;
 {selectedGroup && ` in group "${selectedGroup}"`}
 </div>
 )}

 {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
 <div className="mt-3 text-xs text-gray-800 text-center py-2">
 Type at least 2 characters to search
 </div>
 )}
 </div>
 )}


 <ItemsTable
 items={watchedValues.items || []}
 errors={errors}
 onChange={handleItemsChange}
 mode={mode}
 />

 {errors.items && typeof errors.items === 'object' && 'message' in errors.items && (
 <p className="text-sm text-red-600">{String(errors.items.message || "")}</p>
 )}
 </div>

 {/* Additional Charges */}
 <div className="space-y-4">
 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2" >
 <Plus className="w-5 h-5" />
 Additional Charges (Sampling)
 </h3>

 <AdditionalChargesList
 charges={watchedValues.additionalCharges || []}
 errors={errors}
 onChange={handleAdditionalChargesChange}
 mode={mode}
 />

 {errors.additionalCharges && typeof errors.additionalCharges === 'object' && 'message' in errors.additionalCharges && (
 <p className="text-sm text-red-600">{String(errors.additionalCharges.message || "")}</p>
 )}
 </div>
 </div>
 )
}
