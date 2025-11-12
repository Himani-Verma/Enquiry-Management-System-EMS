'use client'

import { useState, useEffect } from 'react'
import { Eye, Upload, Trash2, History } from 'lucide-react'

interface RateList {
 _id: string
 category: string
 service_name: string
 service_id: string
 testsCount: number
 versionsCount: number
 currentVersion: number
 isActive: boolean
 lastUpdated: string
}

interface RateListTableProps {
 onViewVersions: (id: string) => void
 onUploadNewVersion: (id: string, category: string) => void
 onSoftDelete: (id: string, category: string) => void
}

export default function RateListTable({ 
 onViewVersions, 
 onUploadNewVersion, 
 onSoftDelete 
}: RateListTableProps) {
 const [rateLists, setRateLists] = useState<RateList[]>([])
 const [loading, setLoading] = useState(true)
 const [page, setPage] = useState(1)
 const [totalPages, setTotalPages] = useState(1)
 const [searchTerm, setSearchTerm] = useState('')

 useEffect(() => {
 fetchRateLists()
 }, [page])

 const fetchRateLists = async () => {
 try {
 setLoading(true)
 const response = await fetch(`/api/admin/ratelists?page=${page}&limit=10`)
 const data = await response.json()

 if (data.success) {
 setRateLists(data.rateLists)
 setTotalPages(data.pagination.totalPages)
 }
 } catch (error) {
 console.error('Failed to fetch rate lists:', error)
 } finally {
 setLoading(false)
 }
 }

 const filteredRateLists = rateLists.filter(rl => 
 rl.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
 rl.service_name.toLowerCase().includes(searchTerm.toLowerCase())
 )

 if (loading) {
 return (
 <div className="bg-white rounded-lg shadow p-6">
 <div className="animate-pulse space-y-4">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-16 bg-gray-200 rounded" />
 ))}
 </div>
 </div>
 )
 }

 return (
 <div className="bg-white rounded-lg shadow">
 {/* Search */}
 <div className="p-4 border-b">
 <input
 type="text"
 placeholder="Search by category or service..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
 />
 </div>

 {/* Table */}
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
 Category
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
 Service
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
 Version
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
 Tests
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
 Updated
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
 Actions
 </th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {filteredRateLists.length === 0 ? (
 <tr>
 <td colSpan={6} className="px-6 py-12 text-center text-gray-800">
 No rate lists found
 </td>
 </tr>
 ) : (
 filteredRateLists.map((rateList) => (
 <tr key={rateList._id} className="hover:bg-gray-50">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm font-medium text-gray-900">
 {rateList.category}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-800">
 {rateList.service_name}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
 v{rateList.currentVersion}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
 {rateList.testsCount} tests
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
 {new Date(rateList.lastUpdated).toLocaleDateString()}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
 <div className="flex items-center gap-2">
 <button
 onClick={() => onViewVersions(rateList._id)}
 className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
 title="View Versions"
 >
 <History className="w-4 h-4" />
 </button>
 {typeof window !== 'undefined' && 
 JSON.parse(localStorage.getItem('ems_user') || '{}')?.role === 'admin' && (
 <button
 onClick={() => onUploadNewVersion(rateList._id, rateList.category)}
 className="text-green-600 hover:text-green-900 flex items-center gap-1"
 title="Upload New Version (Admin Only)"
 >
 <Upload className="w-4 h-4" />
 </button>
 )}
 <button
 onClick={() => {
 if (confirm(`Are you sure you want to delete ${rateList.category}?`)) {
 onSoftDelete(rateList._id, rateList.category)
 }
 }}
 className="text-red-600 hover:text-red-900 flex items-center gap-1"
 title="Delete"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="px-4 py-3 border-t flex items-center justify-between">
 <button
 onClick={() => setPage(p => Math.max(1, p - 1))}
 disabled={page === 1}
 className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Previous
 </button>
 <span className="text-sm text-gray-700">
 Page {page} of {totalPages}
 </span>
 <button
 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
 disabled={page === totalPages}
 className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Next
 </button>
 </div>
 )}
 </div>
 )
}

