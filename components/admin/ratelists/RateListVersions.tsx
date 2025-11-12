'use client'

import { useState, useEffect } from 'react'
import { X, Clock, User, CheckCircle } from 'lucide-react'

interface Version {
 versionNumber: number
 testsCount: number
 notes?: string
 createdBy: string
 createdAt: string
 isActive: boolean
}

interface RateListVersionsProps {
 isOpen: boolean
 onClose: () => void
 rateListId: string
}

export default function RateListVersions({ isOpen, onClose, rateListId }: RateListVersionsProps) {
 const [versions, setVersions] = useState<Version[]>([])
 const [currentVersion, setCurrentVersion] = useState(1)
 const [loading, setLoading] = useState(true)
 const [activating, setActivating] = useState<number | null>(null)

 useEffect(() => {
 if (isOpen && rateListId) {
 fetchVersions()
 }
 }, [isOpen, rateListId])

 const fetchVersions = async () => {
 try {
 setLoading(true)
 const response = await fetch(`/api/ratelists/${rateListId}/versions`)
 const data = await response.json()

 if (data.success) {
 setVersions(data.data.versions)
 setCurrentVersion(data.data.currentVersion)
 }
 } catch (error) {
 console.error('Failed to fetch versions:', error)
 } finally {
 setLoading(false)
 }
 }

 const handleActivate = async (versionNumber: number) => {
 if (activating) return

 setActivating(versionNumber)
 try {
 const response = await fetch(`/api/ratelists/${rateListId}/versions`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 version: versionNumber,
 notes: `Activated version ${versionNumber}`,
 activatedBy: 'Admin'
 })
 })

 const data = await response.json()

 if (data.success) {
 fetchVersions() // Refresh
 } else {
 alert(`Failed to activate version: ${data.message}`)
 }
 } catch (error) {
 console.error('Activate error:', error)
 alert('Failed to activate version')
 } finally {
 setActivating(null)
 }
 }

 if (!isOpen) return null

 return (
 <div className="fixed inset-0 z-50 overflow-y-auto">
 <div className="flex min-h-full items-center justify-center p-4">
 <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
 
 <div className="relative w-full max-w-3xl rounded-2xl shadow-2xl bg-white">
 {/* Header */}
 <div className="flex items-center justify-between p-6 border-b">
 <div>
 <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
 <p className="text-sm text-gray-900 mt-1">View and restore previous versions</p>
 </div>
 <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Content */}
 <div className="p-6">
 {loading ? (
 <div className="text-center py-12">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
 <p className="mt-4 text-gray-900">Loading versions...</p>
 </div>
 ) : versions.length === 0 ? (
 <div className="text-center py-12 text-gray-800">
 No versions found
 </div>
 ) : (
 <div className="space-y-3">
 {versions.map((version) => (
 <div
 key={version.versionNumber}
 className={`border rounded-lg p-4 ${
 version.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
 }`}
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 {version.isActive ? (
 <CheckCircle className="w-5 h-5 text-blue-600" />
 ) : (
 <Clock className="w-5 h-5 text-gray-700" />
 )}
 <div>
 <div className="flex items-center gap-2">
 <span className="font-medium text-gray-900">
 Version {version.versionNumber}
 </span>
 {version.isActive && (
 <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
 Current
 </span>
 )}
 </div>
 <div className="flex items-center gap-4 text-sm text-gray-800 mt-1">
 <div className="flex items-center gap-1">
 <User className="w-3 h-3" />
 {version.createdBy}
 </div>
 <div className="flex items-center gap-1">
 <Clock className="w-3 h-3" />
 {new Date(version.createdAt).toLocaleDateString()}
 </div>
 <div>
 {version.testsCount} tests
 </div>
 </div>
 {version.notes && (
 <p className="text-sm text-gray-900 mt-1">{version.notes}</p>
 )}
 </div>
 </div>
 {!version.isActive && (
 <button
 onClick={() => {
 if (confirm(`Activate version ${version.versionNumber}?`)) {
 handleActivate(version.versionNumber)
 }
 }}
 disabled={activating === version.versionNumber}
 className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
 >
 {activating === version.versionNumber ? 'Activating...' : 'Activate'}
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="p-6 border-t flex items-center justify-end">
 <button
 onClick={onClose}
 className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 </div>
 )
}

