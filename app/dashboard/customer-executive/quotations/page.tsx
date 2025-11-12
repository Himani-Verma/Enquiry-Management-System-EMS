'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'
import QuotationTable from '@/components/quotation/QuotationTable'
import QuotationFormModal from '@/components/quotation/QuotationFormModal'
import PreviewDrawer from '@/components/quotation/PreviewDrawer'
import GenerateQuotationButton from '@/components/quotation/GenerateQuotationButton'
import { QuotationDraft, SavedQuotation } from '@/lib/types/quotation'
import { FileText, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function CustomerExecutiveQuotationsPage() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const { user, isAuthenticated, loading } = useAuth()
 const [quotations, setQuotations] = useState<SavedQuotation[]>([])
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [isPreviewOpen, setIsPreviewOpen] = useState(false)
 const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
 const [selectedQuotationId, setSelectedQuotationId] = useState<string>()
 const [previewQuotation, setPreviewQuotation] = useState<QuotationDraft | null>(null)
 const [successMessage, setSuccessMessage] = useState<string | null>(null)
 const [visitorData, setVisitorData] = useState<any>(null)

 // Load quotations from MongoDB
 const loadQuotations = async () => {
 try {
 const token = localStorage.getItem('ems_token')
 const userStr = localStorage.getItem('ems_user')
 
 if (!userStr) return
 
 const currentUser = JSON.parse(userStr)
 
 const headers: any = {
 'Content-Type': 'application/json'
 }
 
 if (token) {
 headers['Authorization'] = `Bearer ${token}`
 }
 
 const response = await fetch(`/api/quotations?userId=${currentUser.id}&userRole=${currentUser.role}`, {
 headers
 })
 
 if (response.ok) {
 const data = await response.json()
 if (data.success && data.quotations) {
 const formattedQuotations = data.quotations.map((q: any) => ({
 id: q._id,
 quotationNo: q.quotationNo,
 date: q.date,
 customerName: q.customerName,
 contactPerson: q.contactPerson,
 totalAmount: q.grandTotal,
 status: q.status,
 createdAt: q.createdAt,
 lastModified: q.updatedAt,
 createdByName: q.createdByName || 'Unknown',
 fullData: {
 quotationNo: q.quotationNo,
 date: q.date,
 customerId: q.customerId,
 vendorId: q.vendorId,
 billTo: q.billTo,
 shipTo: q.shipTo,
 contact: q.contact,
 items: q.items.map((item: any, index: number) => ({
 id: `item-${index}`,
 ...item
 })),
 additionalCharges: q.additionalCharges.map((charge: any, index: number) => ({
 id: `charge-${index}`,
 ...charge
 })),
 subtotal: q.subtotal,
 taxes: q.taxes,
 grandTotal: q.grandTotal,
 amountInWords: q.amountInWords,
 preparedBy: q.preparedBy,
 bankDetails: q.bankDetails,
 terms: q.terms
 }
 }))
 setQuotations(formattedQuotations)
 console.log('✅ Loaded quotations from MongoDB:', formattedQuotations.length)
 }
 }
 } catch (error) {
 console.error('❌ Error loading quotations:', error)
 }
 }

 useEffect(() => {
 loadQuotations()
 }, [])

 useEffect(() => {
 if (!loading && !isAuthenticated) {
 router.push('/login')
 }
 }, [isAuthenticated, loading, router])

 // Check for action=create parameter and fetch visitor data
 useEffect(() => {
 const action = searchParams.get('action')
 const visitorId = searchParams.get('visitorId')
 
 if (action === 'create' && visitorId && !isModalOpen) {
 console.log('✨ Fetching visitor data for quotation:', visitorId)
 
 // Fetch visitor data from API
 const fetchVisitorData = async () => {
 try {
 const token = localStorage.getItem('ems_token')
 const response = await fetch(`/api/visitors/${visitorId}`, {
 headers: {
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 }
 })
 
 if (response.ok) {
 const data = await response.json()
 console.log('✅ Visitor data fetched:', data.visitor)
 setVisitorData(data.visitor)
 handleCreateNew()
 } else {
 console.error('❌ Failed to fetch visitor data')
 // Open modal anyway without pre-fill
 handleCreateNew()
 }
 } catch (error) {
 console.error('❌ Error fetching visitor:', error)
 // Open modal anyway without pre-fill
 handleCreateNew()
 }
 }
 
 fetchVisitorData()
 } else if (action === 'create' && !visitorId && !isModalOpen) {
 // No visitor ID, just open modal normally
 handleCreateNew()
 }
 }, [searchParams])

 const stats = {
 total: quotations.length,
 totalValue: quotations.reduce((sum, q) => sum + q.totalAmount, 0),
 }

 const handleCreateNew = () => {
 setModalMode('create')
 setSelectedQuotationId(undefined)
 setIsModalOpen(true)
 // Clear visitor data if opening without visitor context
 if (!searchParams.get('visitorId')) {
 setVisitorData(null)
 }
 }

 const handleEdit = (id: string) => {
 setModalMode('edit')
 setSelectedQuotationId(id)
 setIsModalOpen(true)
 }

 const handleView = (id: string) => {
 setModalMode('view')
 setSelectedQuotationId(id)
 setIsModalOpen(true)
 }

 const handleDelete = async (id: string) => {
 if (confirm('Are you sure you want to delete this quotation?')) {
 try {
 const token = localStorage.getItem('ems_token')
 const headers: any = {
 'Content-Type': 'application/json'
 }
 
 if (token) {
 headers['Authorization'] = `Bearer ${token}`
 }
 
 const response = await fetch(`/api/quotations?id=${id}`, {
 method: 'DELETE',
 headers
 })
 
 if (response.ok) {
 const data = await response.json()
 if (data.success) {
 console.log('✅ Quotation deleted from MongoDB')
 setSuccessMessage('Quotation deleted successfully!')
 setTimeout(() => setSuccessMessage(null), 3000)
 loadQuotations()
 }
 } else {
 alert('Failed to delete quotation')
 }
 } catch (error) {
 console.error('Error deleting quotation:', error)
 alert('Error deleting quotation. Please try again.')
 }
 }
 }

 const handleSave = async (quotation: QuotationDraft) => {
 try {
 const token = localStorage.getItem('ems_token')
 const userStr = localStorage.getItem('ems_user')
 
 if (!userStr) {
 alert('User not logged in')
 return
 }
 
 const currentUser = JSON.parse(userStr)
 
 const headers: any = {
 'Content-Type': 'application/json'
 }
 
 if (token) {
 headers['Authorization'] = `Bearer ${token}`
 }
 
 if (modalMode === 'create') {
 if (!quotation.items || quotation.items.length === 0) {
 alert('⚠️ Please add at least one item to the quotation before saving.')
 return
 }
 
 if (!quotation.billTo.name) {
 alert('⚠️ Please enter customer name in Bill To section.')
 return
 }
 
 if (!quotation.contact.name) {
 alert('⚠️ Please enter contact person name.')
 return
 }
 
 const { attachments, ...quotationWithoutAttachments } = quotation
 
 const payload = {
 quotationData: {
 ...quotationWithoutAttachments,
 customerName: quotation.billTo.name,
 contactPerson: quotation.contact.name
 },
 userId: currentUser.id,
 userName: currentUser.name
 }
 
 const response = await fetch('/api/quotations', {
 method: 'POST',
 headers,
 body: JSON.stringify(payload)
 })
 
 if (response.ok) {
 const data = await response.json()
 if (data.success) {
 console.log('✅ Quotation created in MongoDB:', data.quotation?._id)
 alert('✅ Quotation saved successfully!')
 setSuccessMessage('Quotation created successfully!')
 setTimeout(() => setSuccessMessage(null), 3000)
 await loadQuotations()
 setIsModalOpen(false)
 } else {
 alert(`Failed to create quotation: ${data.message || data.error || 'Unknown error'}`)
 }
 } else {
 const errorData = await response.json()
 alert(`Failed to create quotation: ${errorData.message || errorData.error || 'Unknown error'}`)
 }
 } else if (modalMode === 'edit') {
 const { attachments, ...quotationWithoutAttachments } = quotation
 
 const response = await fetch('/api/quotations', {
 method: 'PUT',
 headers,
 body: JSON.stringify({
 quotationId: selectedQuotationId,
 quotationData: {
 ...quotationWithoutAttachments,
 customerName: quotation.billTo.name,
 contactPerson: quotation.contact.name
 },
 userId: currentUser.id,
 userName: currentUser.name
 })
 })
 
 if (response.ok) {
 const data = await response.json()
 if (data.success) {
 console.log('✅ Quotation updated in MongoDB')
 setSuccessMessage('Quotation updated successfully!')
 setTimeout(() => setSuccessMessage(null), 3000)
 loadQuotations()
 }
 } else {
 alert('Failed to update quotation')
 }
 }
 
 setIsModalOpen(false)
 } catch (error) {
 console.error('Error saving quotation:', error)
 alert('Error saving quotation. Please try again.')
 }
 }

 const handlePreview = (quotation: QuotationDraft) => {
 setPreviewQuotation(quotation)
 setIsPreviewOpen(true)
 }

 const handleTablePreview = (quotation: any) => {
 if (quotation.fullData) {
 setPreviewQuotation(quotation.fullData)
 setIsPreviewOpen(true)
 } else {
 alert('Quotation data not available for preview')
 }
 }
 
 const handleDownload = async (id: string) => {
 const quotation = quotations.find(q => q.id === id)
 if (!quotation || !quotation.fullData) {
 alert('Quotation data not available')
 return
 }
 
 setPreviewQuotation(quotation.fullData)
 setIsPreviewOpen(true)
 }

 const handleStatusChange = async (id: string, newStatus: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired') => {
 try {
 const token = localStorage.getItem('ems_token')
 const headers: any = {
 'Content-Type': 'application/json'
 }
 
 if (token) {
 headers['Authorization'] = `Bearer ${token}`
 }
 
 const response = await fetch('/api/quotations/status', {
 method: 'PUT',
 headers,
 body: JSON.stringify({
 quotationId: id,
 status: newStatus
 })
 })
 
 if (response.ok) {
 const data = await response.json()
 if (data.success) {
 console.log('✅ Status updated to:', newStatus)
 setSuccessMessage(`Status updated to ${newStatus}!`)
 setTimeout(() => setSuccessMessage(null), 3000)
 await loadQuotations()
 }
 } else {
 const errorData = await response.json()
 alert(`Failed to update status: ${errorData.message || errorData.error}`)
 }
 } catch (error) {
 console.error('Error updating status:', error)
 alert('Error updating status. Please try again.')
 }
 }

 if (loading) {
 return (
 <div className="flex h-screen bg-gray-100">
 <Sidebar userRole="customer-executive" userName={user?.name} />
 <div className="flex-1 flex flex-col overflow-hidden">
 <DashboardHeader userRole="customer-executive" userName={user?.name} />
 <div className="flex-1 p-6 flex items-center justify-center">
 <div className="text-gray-900">Loading quotations...</div>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="flex h-screen bg-gray-100">
 <Sidebar userRole={user?.role as 'admin' | 'executive' | 'sales-executive' | 'customer-executive' || 'customer-executive'} userName={user?.name} />
 <div className="flex-1 flex flex-col overflow-hidden">
 <DashboardHeader
 userRole={user?.role as 'admin' | 'executive' | 'sales-executive' | 'customer-executive' || 'customer-executive'}
 userName={user?.name}
 />

 <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
 <div className="mb-6">
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
 Quotation Management
 </h1>
 <p className="text-gray-900">
 Create, manage and track all your quotations in one place
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
 <StatCard
 title="Total Quotations"
 value={stats.total}
 icon={<FileText className="w-6 h-6" />}
 color="from-blue-500 to-blue-600"
 bgColor="bg-blue-50"
 />
 <StatCard
 title="Total Value"
 value={stats.totalValue > 0 ? `₹${(stats.totalValue / 100000).toFixed(1)}L` : '₹0'}
 icon={<TrendingUp className="w-6 h-6" />}
 color="from-purple-500 to-purple-600"
 bgColor="bg-purple-50"
 />
 </div>

 {quotations.length === 0 && (
 <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
 <div className="flex items-center">
 <div className="flex-shrink-0">
 <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
 </svg>
 </div>
 <div className="ml-3">
 <p className="text-sm text-blue-700">
 <strong>Welcome to Quotation Management!</strong> Click the "Generate Quotation" button above to create your first quotation.
 </p>
 </div>
 </div>
 </div>
 )}

 <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
 <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h2 className="text-xl md:text-2xl font-bold text-white">
 All Quotations
 </h2>
 <p className="text-blue-100 text-sm mt-1">
 {quotations.length} {quotations.length === 1 ? 'quotation' : 'quotations'} found
 </p>
 </div>
 <div className="flex gap-2">
 <GenerateQuotationButton onClick={handleCreateNew} />
 </div>
 </div>
 </div>

 <div className="p-6">
 <QuotationTable
 quotations={quotations}
 onEdit={handleEdit}
 onView={handleView}
 onDelete={handleDelete}
 onPreview={handleTablePreview}
 onDownload={handleDownload}
 onStatusChange={handleStatusChange}
 userRole="customer-executive"
 />
 </div>
 </div>
 </main>
 </div>

 <QuotationFormModal
 isOpen={isModalOpen}
 mode={modalMode}
 quotationId={selectedQuotationId}
 quotationData={selectedQuotationId ? quotations.find(q => q.id === selectedQuotationId)?.fullData : undefined}
 visitorData={visitorData}
 onSave={handleSave}
 onClose={() => {
 setIsModalOpen(false)
 setVisitorData(null) // Clear visitor data when modal closes
 }}
 onPreview={handlePreview}
 />

 {previewQuotation && (
 <PreviewDrawer
 isOpen={isPreviewOpen}
 quotation={previewQuotation}
 onClose={() => setIsPreviewOpen(false)}
 />
 )}
 </div>
 )
}

interface StatCardProps {
 title: string
 value: string | number
 icon: React.ReactNode
 color: string
 bgColor: string
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
 return (
 <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group">
 <div className="p-6">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
 {title}
 </p>
 <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
 {value}
 </p>
 </div>
 <div className={`${bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
 <div className={`bg-gradient-to-br ${color} text-white p-2 rounded-lg shadow-lg`}>
 {icon}
 </div>
 </div>
 </div>
 </div>
 <div className={`h-1 bg-gradient-to-r ${color}`}></div>
 </div>
 )
}
