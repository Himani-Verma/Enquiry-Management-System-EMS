'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Download, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'

interface RateList {
 _id: string
 category: string
 testCount?: number
 lastUpdated: Date
}

interface RateListPickerProps {
 isOpen: boolean
 onClose: () => void
 onSelect?: (category: string) => void
 onUpload: (file: File) => void
 onExcelParse: (items: any[]) => void
}

export default function RateListPicker({ isOpen, onClose, onSelect, onUpload, onExcelParse }: RateListPickerProps) {
 const [selectedFile, setSelectedFile] = useState<File | null>(null)
 const [isParsing, setIsParsing] = useState(false)
 const [rateLists, setRateLists] = useState<RateList[]>([])
 const [loading, setLoading] = useState(false)

 // Fetch rate lists when modal opens
 useEffect(() => {
 if (isOpen) {
 fetchRateLists()
 }
 }, [isOpen])

 const fetchRateLists = async () => {
 try {
 setLoading(true)
 const response = await fetch('/api/ratelists')
 const data = await response.json()
 
 if (data.success) {
 setRateLists(data.rateLists || [])
 }
 } catch (error) {
 console.error('Failed to fetch rate lists:', error)
 } finally {
 setLoading(false)
 }
 }

 const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0]
 if (file) {
 setSelectedFile(file)
 }
 }

 const handleUpload = () => {
 if (selectedFile) {
 onUpload(selectedFile)
 }
 }

 const handleExcelParse = async () => {
 if (!selectedFile) return
 
 setIsParsing(true)
 try {
 const data = await selectedFile.arrayBuffer()
 const workbook = XLSX.read(data)
 const sheetName = workbook.SheetNames[0]
 const worksheet = workbook.Sheets[sheetName]
 const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
 
 // Skip header row and convert to items format
 const items = jsonData.slice(1).map((row: any[], index: number) => ({
 id: `imported-${index}`,
 sampleName: row[0] || '',
 testParameters: row[1] || '',
 noOfSamples: 1,
 unit: row[2] || 'Sample',
 unitPrice: parseFloat(row[3]) || 0,
 totalPrice: parseFloat(row[3]) || 0
 })).filter(item => item.sampleName && item.unitPrice > 0)
 
 onExcelParse(items)
 onClose()
 } catch (error) {
 console.error('Error parsing Excel file:', error)
 alert('Error parsing Excel file. Please check the format.')
 } finally {
 setIsParsing(false)
 }
 }

 if (!isOpen) return null

 return (
 <div className="fixed inset-0 z-50 overflow-y-auto">
 <div className="flex min-h-full items-center justify-center p-4">
 <div 
 className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
 onClick={onClose}
 />
 
 <div 
 className="relative w-full max-w-2xl rounded-2xl shadow-2xl"
 style={{ 
 backgroundColor: 'var(--surface-1)',
 border: '1px solid var(--border)'
 }}
 >
 {/* Header */}
 <div 
 className="flex items-center justify-between p-6 border-b"
 style={{ borderColor: 'var(--border)' }}
 >
 <div>
 <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
 Select or Upload Rate List
 </h2>
 <p className="text-sm mt-1" style={{ color: 'var(--text-gray-900)' }}>
 Choose from existing rate lists or upload a new one
 </p>
 </div>
 <button
 onClick={onClose}
 className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
 style={{ color: 'var(--text-gray-900)' }}
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="p-6 space-y-6">
 {/* Existing Rate Lists */}
 <div className="space-y-4">
 <h3 className="text-lg font-medium" style={{ color: 'var(--text)' }}>
 Existing Rate Lists
 </h3>
 <div className="space-y-3">
 {loading ? (
 <div className="text-center py-8" style={{ color: 'var(--text-gray-900)' }}>
 Loading rate lists...
 </div>
 ) : rateLists.length === 0 ? (
 <div className="text-center py-8" style={{ color: 'var(--text-gray-900)' }}>
 No rate lists available
 </div>
 ) : (
 rateLists.map((rateList) => (
 <button
 key={rateList._id}
 onClick={() => {
 if (onSelect) {
 onSelect(rateList.category)
 }
 onClose()
 }}
 className="w-full p-4 rounded-lg border text-left transition-colors hover:bg-gray-50"
 style={{ 
 borderColor: 'var(--border)',
 backgroundColor: 'var(--surface-1)'
 }}
 >
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
 <FileText className="w-5 h-5" />
 </div>
 <div>
 <div className="font-medium" style={{ color: 'var(--text)' }}>
 {rateList.category}
 </div>
 {rateList.testCount && (
 <div className="text-sm" style={{ color: 'var(--text-gray-900)' }}>
 {rateList.testCount} tests available
 </div>
 )}
 </div>
 </div>
 </button>
 ))
 )}
 </div>
 </div>

 {/* Upload New Rate List */}
 <div className="space-y-4">
 <h3 className="text-lg font-medium" style={{ color: 'var(--text)' }}>
 Upload New Rate List
 </h3>
 
 <div 
 className="p-6 rounded-lg border-2 border-dashed"
 style={{ 
 borderColor: 'var(--border)',
 backgroundColor: 'var(--surface-2)'
 }}
 >
 <div className="text-center">
 <Upload className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--text-gray-900)' }} />
 <div className="mb-4">
 <input
 type="file"
 accept=".xlsx,.xls,.csv"
 onChange={handleFileSelect}
 className="hidden"
 id="rate-list-upload"
 />
 <label
 htmlFor="rate-list-upload"
 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white cursor-pointer transition-colors"
 style={{ backgroundColor: 'var(--primary)' }}
 >
 <Upload className="w-4 h-4" />
 Choose File
 </label>
 </div>
 
 {selectedFile && (
 <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-1)' }}>
 <div className="flex items-center gap-2">
 <FileText className="w-4 h-4" style={{ color: 'var(--text-gray-900)' }} />
 <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
 {selectedFile.name}
 </span>
 <span className="text-xs" style={{ color: 'var(--text-gray-900)' }}>
 ({(selectedFile.size / 1024).toFixed(1)} KB)
 </span>
 </div>
 </div>
 )}
 
 <p className="text-sm" style={{ color: 'var(--text-gray-900)' }}>
 Supported formats: Excel (.xlsx, .xls), CSV (.csv)
 </p>
 <p className="text-xs mt-1" style={{ color: 'var(--text-gray-900)' }}>
 Maximum file size: 10MB
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Footer */}
 <div 
 className="flex items-center justify-between p-6 border-t"
 style={{ borderColor: 'var(--border)' }}
 >
 <button
 onClick={onClose}
 className="px-4 py-2 rounded-lg border transition-colors"
 style={{ 
 borderColor: 'var(--border)',
 color: 'var(--text-gray-900)'
 }}
 >
 Cancel
 </button>
 
 {selectedFile && (
 <div className="flex items-center gap-3">
 <button
 onClick={handleUpload}
 className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
 style={{ backgroundColor: 'var(--accent)' }}
 >
 <Upload className="w-4 h-4" />
 Upload File
 </button>
 
 {selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') ? (
 <button
 onClick={handleExcelParse}
 disabled={isParsing}
 className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
 style={{ backgroundColor: '#2d4891' }}
 >
 <FileText className="w-4 h-4" />
 {isParsing ? 'Parsing...' : 'Parse & Import'}
 </button>
 ) : null}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )
}
