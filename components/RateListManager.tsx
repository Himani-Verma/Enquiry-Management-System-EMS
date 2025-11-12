'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, Database, TrendingUp, Clock, Users, Edit } from 'lucide-react'
import RateListEditor from './quotation/RateListEditor'

interface ImportSummary {
 totalProcessed: number
 updated: number
 inserted: number
 errors: number
}

interface ImportResult {
 success: boolean
 message: string
 summary?: ImportSummary
 details?: string[] | string
}

interface RateStats {
 totalRates: number
 activeGroups: number
 avgRate: number
 lastUpdated: string
}

export default function RateListManager() {
 const [isExporting, setIsExporting] = useState(false)
 const [isImporting, setIsImporting] = useState(false)
 const [importResult, setImportResult] = useState<ImportResult | null>(null)
 const [selectedFile, setSelectedFile] = useState<File | null>(null)
 const [stats, setStats] = useState<RateStats | null>(null)
 const [isRateListEditorOpen, setIsRateListEditorOpen] = useState(false)
 const fileInputRef = useRef<HTMLInputElement>(null)

 // Fetch stats on component mount
 React.useEffect(() => {
 const fetchStats = async () => {
 try {
 const response = await fetch('/api/rate/stats')
 const data = await response.json()
 if (data.success) {
 setStats(data.stats)
 }
 } catch (error) {
 console.error('Failed to fetch stats:', error)
 }
 }
 
 fetchStats()
 }, [])

 const handleExport = async () => {
 setIsExporting(true)
 setImportResult(null)
 
 try {
 const response = await fetch('/api/rate/export', {
 method: 'GET',
 })
 
 if (!response.ok) {
 throw new Error('Failed to export rate list')
 }
 
 // Get the filename from the response headers
 const contentDisposition = response.headers.get('content-disposition')
 const filename = contentDisposition
 ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
 : `rate_list_${new Date().toISOString().split('T')[0]}.xlsx`
 
 // Create blob and download
 const blob = await response.blob()
 const url = window.URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = filename
 document.body.appendChild(a)
 a.click()
 window.URL.revokeObjectURL(url)
 document.body.removeChild(a)
 
 setImportResult({
 success: true,
 message: 'Rate list exported successfully!'
 })
 
 } catch (error) {
 console.error('Export error:', error)
 setImportResult({
 success: false,
 message: 'Failed to export rate list',
 details: [error instanceof Error ? error.message : 'Unknown error']
 })
 } finally {
 setIsExporting(false)
 }
 }

 const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0]
 if (file) {
 setSelectedFile(file)
 setImportResult(null)
 }
 }

 const handleImport = async () => {
 if (!selectedFile) {
 setImportResult({
 success: false,
 message: 'Please select a file to import'
 })
 return
 }
 
 setIsImporting(true)
 setImportResult(null)
 
 try {
 const formData = new FormData()
 formData.append('file', selectedFile)
 
 const response = await fetch('/api/rate/import', {
 method: 'POST',
 body: formData
 })
 
 const result = await response.json()
 setImportResult(result)
 
 if (result.success) {
 // Clear the selected file on successful import
 setSelectedFile(null)
 if (fileInputRef.current) {
 fileInputRef.current.value = ''
 }
 
 // Refresh stats after successful import
 try {
 const statsResponse = await fetch('/api/rate/stats')
 const statsData = await statsResponse.json()
 if (statsData.success) {
 setStats(statsData.stats)
 }
 } catch (error) {
 console.error('Failed to refresh stats:', error)
 }
 }
 
 } catch (error) {
 console.error('Import error:', error)
 setImportResult({
 success: false,
 message: 'Failed to import rate list',
 details: [error instanceof Error ? error.message : 'Unknown error']
 })
 } finally {
 setIsImporting(false)
 }
 }

 const clearFile = () => {
 setSelectedFile(null)
 setImportResult(null)
 if (fileInputRef.current) {
 fileInputRef.current.value = ''
 }
 }

 return (
 <div className="space-y-6">
 {/* Page Header */}
 <div className="mb-8">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate Management</h1>
 <p className="text-gray-900">Manage your rate list with direct editing, Excel import/export, and analytics</p>
 </div>
 </div>
 </div>

 {/* Stats Overview */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-900">Total Rates</p>
 <p className="text-2xl font-bold text-gray-900">{stats?.totalRates || '-'}</p>
 </div>
 <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
 <Database className="h-6 w-6 text-blue-600" />
 </div>
 </div>
 </div>
 
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-900">Active Groups</p>
 <p className="text-2xl font-bold text-gray-900">{stats?.activeGroups || '-'}</p>
 </div>
 <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
 <Users className="h-6 w-6 text-green-600" />
 </div>
 </div>
 </div>
 
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-900">Avg. Rate</p>
 <p className="text-2xl font-bold text-gray-900">₹{stats?.avgRate || '-'}</p>
 </div>
 <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
 <TrendingUp className="h-6 w-6 text-yellow-600" />
 </div>
 </div>
 </div>
 
 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-gray-900">Last Updated</p>
 <p className="text-2xl font-bold text-gray-900">{stats?.lastUpdated || '-'}</p>
 </div>
 <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
 <Clock className="h-6 w-6 text-purple-600" />
 </div>
 </div>
 </div>
 </div>



 {/* Management Actions */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
 
 {/* Direct Edit Card */}
 <Card className="shadow-sm border border-gray-200">
 <CardHeader className="bg-white border-b border-gray-200">
 <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
 <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
 <Edit className="h-4 w-4 text-purple-600" />
 </div>
 Direct Edit
 </CardTitle>
 <CardDescription className="text-gray-900">
 Edit rates directly in the browser interface
 </CardDescription>
 </CardHeader>
 <CardContent className="p-6">
 <Button 
 onClick={() => setIsRateListEditorOpen(true)}
 className="w-full bg-purple-600 hover:bg-purple-700 text-white"
 >
 <Edit className="mr-2 h-4 w-4" />
 Open Rate Editor
 </Button>
 </CardContent>
 </Card>

 {/* Export Card */}
 <Card className="shadow-sm border border-gray-200">
 <CardHeader className="bg-white border-b border-gray-200">
 <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
 <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
 <Download className="h-4 w-4 text-green-600" />
 </div>
 Export Excel
 </CardTitle>
 <CardDescription className="text-gray-900">
 Download rate list as Excel file for offline editing
 </CardDescription>
 </CardHeader>
 <CardContent className="p-6">
 <Button 
 onClick={handleExport} 
 disabled={isExporting}
 className="w-full bg-green-600 hover:bg-green-700 text-white"
 >
 {isExporting ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Exporting...
 </>
 ) : (
 <>
 <Download className="mr-2 h-4 w-4" />
 Export to Excel
 </>
 )}
 </Button>
 </CardContent>
 </Card>

 {/* Import Card */}
 <Card className="shadow-sm border border-gray-200">
 <CardHeader className="bg-white border-b border-gray-200">
 <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
 <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
 <Upload className="h-4 w-4 text-blue-600" />
 </div>
 Import Excel
 </CardTitle>
 <CardDescription className="text-gray-900">
 Upload edited Excel file to update rates
 </CardDescription>
 </CardHeader>
 <CardContent className="p-6 space-y-4">
 <div className="space-y-3">
 <input
 ref={fileInputRef}
 type="file"
 accept=".xlsx,.xls"
 onChange={handleFileSelect}
 className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none hover:bg-gray-100 file:py-2 file:px-4 file:mr-4 file:border-0 file:bg-blue-600 file:text-white file:rounded-md file:cursor-pointer hover:file:bg-blue-700"
 />
 <p className="text-xs text-gray-800">Supports .xlsx and .xls files</p>
 </div>
 
 {selectedFile && (
 <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <FileSpreadsheet className="h-5 w-5 text-green-600" />
 <div>
 <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
 <p className="text-xs text-gray-800">{(selectedFile.size / 1024).toFixed(1)} KB</p>
 </div>
 </div>
 <Button 
 variant="outline" 
 size="sm" 
 onClick={clearFile}
 className="text-red-600 hover:text-red-700"
 >
 Remove
 </Button>
 </div>
 )}
 
 <Button 
 onClick={handleImport} 
 disabled={!selectedFile || isImporting}
 className="w-full bg-blue-600 hover:bg-blue-700 text-white"
 >
 {isImporting ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Importing...
 </>
 ) : (
 <>
 <Upload className="mr-2 h-4 w-4" />
 Import from Excel
 </>
 )}
 </Button>
 </CardContent>
 </Card>
 </div>

 {/* Results Section */}
 {importResult && (
 <Card className="shadow-sm border border-gray-200 mb-8">
 <CardContent className="p-6">
 <div className={`rounded-lg p-6 border ${
 importResult.success 
 ? 'bg-green-50 border-green-200' 
 : 'bg-red-50 border-red-200'
 }`}>
 <div className="flex items-start gap-4">
 <div className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
 importResult.success ? 'bg-green-100' : 'bg-red-100'
 }`}>
 {importResult.success ? (
 <CheckCircle className="h-6 w-6 text-green-600" />
 ) : (
 <AlertCircle className="h-6 w-6 text-red-600" />
 )}
 </div>
 <div className="flex-1">
 <h4 className={`font-semibold text-lg mb-2 ${
 importResult.success ? 'text-green-900' : 'text-red-900'
 }`}>
 {importResult.message}
 </h4>
 
 {importResult.summary && (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
 <div className="bg-white rounded-lg p-3 border border-gray-200">
 <p className="text-sm text-gray-900">Total Processed</p>
 <p className="text-xl font-bold text-gray-900">{importResult.summary.totalProcessed}</p>
 </div>
 <div className="bg-white rounded-lg p-3 border border-gray-200">
 <p className="text-sm text-gray-900">Updated</p>
 <p className="text-xl font-bold text-blue-600">{importResult.summary.updated}</p>
 </div>
 <div className="bg-white rounded-lg p-3 border border-gray-200">
 <p className="text-sm text-gray-900">Inserted</p>
 <p className="text-xl font-bold text-green-600">{importResult.summary.inserted}</p>
 </div>
 <div className="bg-white rounded-lg p-3 border border-gray-200">
 <p className="text-sm text-gray-900">Errors</p>
 <p className={`text-xl font-bold ${importResult.summary.errors > 0 ? 'text-red-600' : 'text-gray-700'}`}>
 {importResult.summary.errors}
 </p>
 </div>
 </div>
 )}
 
 {importResult.details && (
 <div className="bg-white rounded-lg p-4 border border-gray-200">
 <h5 className="font-medium text-gray-900 mb-2">Details:</h5>
 {Array.isArray(importResult.details) ? (
 <ul className="text-sm space-y-1">
 {importResult.details.map((detail, index) => (
 <li key={index} className="flex items-start gap-2">
 <span className="text-gray-700 mt-1">•</span>
 <span className="text-gray-700">{detail}</span>
 </li>
 ))}
 </ul>
 ) : (
 <p className="text-sm text-gray-700">{importResult.details}</p>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 )}

 {/* Instructions Card */}
 <Card className="shadow-sm border border-gray-200">
 <CardHeader className="bg-white border-b border-gray-200">
 <CardTitle className="flex items-center gap-3 text-gray-900">
 <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
 <FileSpreadsheet className="h-4 w-4 text-gray-900" />
 </div>
 How to Use
 </CardTitle>
 </CardHeader>
 <CardContent className="p-6">
 

 <div className="grid md:grid-cols-3 gap-6 mb-6">
 <div className="text-center">
 <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <span className="text-2xl font-bold text-green-600">1</span>
 </div>
 <h3 className="font-semibold text-gray-900 mb-2">Export</h3>
 <p className="text-sm text-gray-900">Click "Export to Excel" to download the current rate list</p>
 </div>
 
 <div className="text-center">
 <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <span className="text-2xl font-bold text-blue-600">2</span>
 </div>
 <h3 className="font-semibold text-gray-900 mb-2">Edit</h3>
 <p className="text-sm text-gray-900">Open the Excel file and modify rates, groups, or test parameters</p>
 </div>
 
 <div className="text-center">
 <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <span className="text-2xl font-bold text-purple-600">3</span>
 </div>
 <h3 className="font-semibold text-gray-900 mb-2">Import</h3>
 <p className="text-sm text-gray-900">Save the Excel file and upload it using the import section</p>
 </div>
 </div>
 
 <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
 <div className="flex items-start gap-3">
 <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
 <div>
 <h4 className="font-semibold text-yellow-900 mb-2">Important Guidelines</h4>
 <ul className="text-sm text-yellow-800 space-y-2">
 <li className="flex items-start gap-2">
 <span className="text-yellow-600 mt-1">•</span>
 <span>Keep the ID column intact for existing records (leave blank for new records)</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-yellow-600 mt-1">•</span>
 <span>Group and Test Parameter (Methods) columns are required</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-yellow-600 mt-1">•</span>
 <span>Rate (₹) values must be numeric and non-negative</span>
 </li>
 <li className="flex items-start gap-2">
 <span className="text-yellow-600 mt-1">•</span>
 <span>The system will update existing records and create new ones as needed</span>
 </li>
 </ul>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Rate List Editor Modal */}
 <RateListEditor
 isOpen={isRateListEditorOpen}
 onClose={() => {
 setIsRateListEditorOpen(false)
 // Refresh stats after editing
 const fetchStats = async () => {
 try {
 const response = await fetch('/api/rate/stats')
 const data = await response.json()
 if (data.success) {
 setStats(data.stats)
 }
 } catch (error) {
 console.error('Failed to refresh stats:', error)
 }
 }
 fetchStats()
 }}
 />
 </div>
 )
}