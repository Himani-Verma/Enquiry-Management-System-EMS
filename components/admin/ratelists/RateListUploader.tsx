'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, CheckCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

interface RateListUploaderProps {
 isOpen: boolean
 onClose: () => void
 onSuccess: () => void
 existingRateListId?: string
 category?: string
}

export default function RateListUploader({ 
 isOpen, 
 onClose, 
 onSuccess,
 existingRateListId,
 category
}: RateListUploaderProps) {
 const [selectedFile, setSelectedFile] = useState<File | null>(null)
 const [notes, setNotes] = useState('')
 const [serviceId, setServiceId] = useState('')
 const [services, setServices] = useState<Array<{_id: string, name: string}>>([])
 const [loading, setLoading] = useState(false)
 const [preview, setPreview] = useState<any[]>([])
 const [uploadSuccess, setUploadSuccess] = useState(false)
 const fileInputRef = useRef<HTMLInputElement>(null)

 // Fetch services on mount
 useEffect(() => {
 if (isOpen) {
 fetchServices()
 }
 }, [isOpen])

 const fetchServices = async () => {
 try {
 const response = await fetch('/api/services')
 const data = await response.json()
 if (data.success && data.services) {
 const flatServices = Object.values(data.services).flat()
 setServices(flatServices)
 }
 } catch (error) {
 console.error('Failed to fetch services:', error)
 }
 }

 const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0]
 if (file) {
 setSelectedFile(file)
 
 // Preview Excel file
 try {
 const buffer = await file.arrayBuffer()
 const workbook = XLSX.read(buffer)
 const sheetName = workbook.SheetNames[0]
 const worksheet = workbook.Sheets[sheetName]
 const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)
 setPreview(jsonData.slice(0, 5)) // Show first 5 rows
 } catch (error) {
 console.error('Failed to preview file:', error)
 }
 }
 }

 const handleUpload = async () => {
 if (!selectedFile) {
 alert('Please select a file')
 return
 }

 setLoading(true)
 try {
 // Get auth token
 const token = typeof window !== 'undefined' ? localStorage.getItem('ems_token') : null
 
 const formData = new FormData()
 formData.append('file', selectedFile)
 if (serviceId) formData.append('service_id', serviceId)
 if (category) formData.append('category', category)
 formData.append('versioning', 'true')
 formData.append('notes', notes)

 const headers: HeadersInit = {}
 if (token) {
 headers['Authorization'] = `Bearer ${token}`
 }

 const response = await fetch('/api/ratelists/upload', {
 method: 'POST',
 headers,
 body: formData
 })

 const data = await response.json()

 if (data.success) {
 setUploadSuccess(true)
 setTimeout(() => {
 onSuccess()
 handleClose()
 }, 2000)
 } else {
 alert(`Upload failed: ${data.message}`)
 }
 } catch (error) {
 console.error('Upload error:', error)
 alert('Failed to upload file')
 } finally {
 setLoading(false)
 }
 }

 const handleClose = () => {
 setSelectedFile(null)
 setNotes('')
 setPreview([])
 setUploadSuccess(false)
 onClose()
 }

 if (!isOpen) return null

 return (
 <div className="fixed inset-0 z-50 overflow-y-auto">
 <div className="flex min-h-full items-center justify-center p-4">
 <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
 
 <div className="relative w-full max-w-3xl rounded-2xl shadow-2xl bg-white">
 {/* Header */}
 <div className="flex items-center justify-between p-6 border-b">
 <div>
 <h2 className="text-xl font-semibold text-gray-900">Upload Rate List</h2>
 <p className="text-sm text-gray-900 mt-1">
 {existingRateListId ? 'Upload new version' : 'Upload Excel file'}
 </p>
 </div>
 <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="p-6 space-y-6">
 {uploadSuccess ? (
 <div className="text-center py-12">
 <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Successful!</h3>
 <p className="text-gray-900">Rate list has been uploaded and versioned.</p>
 </div>
 ) : (
 <>
 {/* Service Selection */}
 {!category && (
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Select Service (Optional - will auto-detect from filename)
 </label>
 <select
 value={serviceId}
 onChange={(e) => setServiceId(e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
 >
 <option value="">Auto-detect from filename</option>
 {services.map(service => (
 <option key={service._id} value={service._id}>
 {service.name}
 </option>
 ))}
 </select>
 </div>
 )}

 {/* File Upload */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Excel File
 </label>
 <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
 <input
 ref={fileInputRef}
 type="file"
 accept=".xlsx,.xls"
 onChange={handleFileSelect}
 className="hidden"
 />
 <button
 onClick={() => fileInputRef.current?.click()}
 className="flex flex-col items-center gap-3"
 >
 <Upload className="w-8 h-8 text-gray-700" />
 <span className="text-sm text-gray-900">
 {selectedFile ? selectedFile.name : 'Click to select Excel file'}
 </span>
 </button>
 </div>
 </div>

 {/* Preview */}
 {preview.length > 0 && (
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Preview (first 5 rows)
 </label>
 <div className="border rounded-lg overflow-auto max-h-60">
 <table className="w-full text-xs">
 <thead className="bg-gray-50">
 <tr>
 {Object.keys(preview[0]).map(key => (
 <th key={key} className="px-2 py-1 text-left border-b">{key}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {preview.map((row, i) => (
 <tr key={i}>
 {Object.values(row).map((cell, j) => (
 <td key={j} className="px-2 py-1 border-b">{String(cell)}</td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Notes */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Version Notes (Optional)
 </label>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="e.g., Updated pricing for Q1 2025"
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
 rows={3}
 />
 </div>
 </>
 )}
 </div>

 {/* Footer */}
 {!uploadSuccess && (
 <div className="flex items-center justify-end gap-3 p-6 border-t">
 <button
 onClick={handleClose}
 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
 >
 Cancel
 </button>
 <button
 onClick={handleUpload}
 disabled={!selectedFile || loading}
 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {loading ? 'Uploading...' : 'Upload File'}
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 )
}

