'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save, Search } from 'lucide-react'

interface RateItem {
 _id?: string
 id: number
 group: string
 testParameter: string
 rate: number
}

interface RateListEditorProps {
 isOpen: boolean
 onClose: () => void
}

export default function RateListEditor({ isOpen, onClose }: RateListEditorProps) {
 const [rateItems, setRateItems] = useState<RateItem[]>([])
 const [filteredItems, setFilteredItems] = useState<RateItem[]>([])
 const [loading, setLoading] = useState(false)
 const [saving, setSaving] = useState(false)
 const [searchQuery, setSearchQuery] = useState('')
 const [selectedGroup, setSelectedGroup] = useState('')
 const [groups, setGroups] = useState<string[]>([])
 const [editingId, setEditingId] = useState<number | null>(null)

 // Fetch all rate items
 useEffect(() => {
 if (isOpen) {
 fetchRateItems()
 fetchGroups()
 }
 }, [isOpen])

 // Filter items based on search and group
 useEffect(() => {
 let filtered = rateItems

 if (searchQuery.trim()) {
 filtered = filtered.filter(item =>
 item.testParameter.toLowerCase().includes(searchQuery.toLowerCase())
 )
 }

 if (selectedGroup) {
 filtered = filtered.filter(item => item.group === selectedGroup)
 }

 setFilteredItems(filtered)
 }, [rateItems, searchQuery, selectedGroup])

 const fetchRateItems = async () => {
 try {
 setLoading(true)
 const response = await fetch('/api/rate/all')
 const data = await response.json()
 if (data.success) {
 setRateItems(data.items || [])
 }
 } catch (error) {
 console.error('Failed to fetch rate items:', error)
 } finally {
 setLoading(false)
 }
 }

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

 const handleAddNew = () => {
 const newId = Math.max(0, ...rateItems.map(item => item.id)) + 1
 const newItem: RateItem = {
 id: newId,
 group: '',
 testParameter: '',
 rate: 0
 }
 setRateItems([newItem, ...rateItems])
 setEditingId(newId)
 }

 const handleUpdate = (id: number, field: keyof RateItem, value: string | number) => {
 setRateItems(items =>
 items.map(item =>
 item.id === id ? { ...item, [field]: value } : item
 )
 )
 }

 const handleDelete = async (id: number, _id?: string) => {
 if (!confirm('Are you sure you want to delete this item?')) return

 if (_id) {
 try {
 const response = await fetch(`/api/rate/${_id}`, {
 method: 'DELETE'
 })
 const data = await response.json()
 if (data.success) {
 setRateItems(items => items.filter(item => item.id !== id))
 } else {
 alert('Failed to delete item')
 }
 } catch (error) {
 console.error('Failed to delete:', error)
 alert('Error deleting item')
 }
 } else {
 setRateItems(items => items.filter(item => item.id !== id))
 }
 }

 const handleSave = async (item: RateItem) => {
 if (!item.group || !item.testParameter) {
 alert('Group and Test Parameter are required')
 return
 }

 try {
 setSaving(true)
 const response = await fetch('/api/rate', {
 method: item._id ? 'PUT' : 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(item)
 })

 const data = await response.json()
 if (data.success) {
 setEditingId(null)
 fetchRateItems()
 fetchGroups()
 } else {
 alert('Failed to save item')
 }
 } catch (error) {
 console.error('Failed to save:', error)
 alert('Error saving item')
 } finally {
 setSaving(false)
 }
 }

 if (!isOpen) return null

 return (
 <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
 <div className="flex min-h-full items-center justify-center p-4">
 <div className="fixed inset-0" onClick={onClose} />
 
 <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
 {/* Header */}
 <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 border-b border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-white">
 📝 Edit Rate List
 </h2>
 <p className="text-green-100 text-sm mt-1">
 Manage test parameters and rates
 </p>
 </div>
 <button
 onClick={onClose}
 className="p-2 rounded-lg hover:bg-white/20 transition-all text-white"
 >
 <X className="w-6 h-6" />
 </button>
 </div>
 </div>

 {/* Toolbar */}
 <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
 <div className="flex flex-col sm:flex-row gap-3">
 <button
 onClick={handleAddNew}
 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
 >
 <Plus className="w-4 h-4" />
 Add New Item
 </button>

 <div className="flex-1 flex gap-3">
 <select
 value={selectedGroup}
 onChange={(e) => setSelectedGroup(e.target.value)}
 className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
 >
 <option value="">All Groups</option>
 {groups.map((group) => (
 <option key={group} value={group}>
 {group}
 </option>
 ))}
 </select>

 <div className="flex-1 relative">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-700" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search test parameters..."
 className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
 />
 </div>
 </div>
 </div>
 </div>

 {/* Table */}
 <div className="flex-1 overflow-y-auto p-6">
 {loading ? (
 <div className="text-center py-12 text-gray-800">Loading...</div>
 ) : filteredItems.length === 0 ? (
 <div className="text-center py-12 text-gray-800">
 {searchQuery || selectedGroup ? 'No items found matching your filters' : 'No items yet. Click "Add New Item" to get started.'}
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead className="bg-gray-100 sticky top-0">
 <tr>
 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Group</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Test Parameter</th>
 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rate (₹)</th>
 <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {filteredItems.map((item) => (
 <tr key={item.id} className="hover:bg-gray-50">
 <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
 <td className="px-4 py-3">
 {editingId === item.id ? (
 <input
 type="text"
 value={item.group}
 onChange={(e) => handleUpdate(item.id, 'group', e.target.value)}
 className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
 placeholder="Enter group"
 />
 ) : (
 <span className="text-sm text-gray-900">{item.group}</span>
 )}
 </td>
 <td className="px-4 py-3">
 {editingId === item.id ? (
 <textarea
 value={item.testParameter}
 onChange={(e) => handleUpdate(item.id, 'testParameter', e.target.value)}
 className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
 placeholder="Enter test parameter"
 rows={2}
 />
 ) : (
 <span className="text-sm text-gray-900">{item.testParameter}</span>
 )}
 </td>
 <td className="px-4 py-3">
 {editingId === item.id ? (
 <input
 type="number"
 value={item.rate}
 onChange={(e) => handleUpdate(item.id, 'rate', parseFloat(e.target.value) || 0)}
 className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
 placeholder="0"
 />
 ) : (
 <span className="text-sm font-semibold text-gray-900">₹{item.rate}</span>
 )}
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center justify-center gap-2">
 {editingId === item.id ? (
 <>
 <button
 onClick={() => handleSave(item)}
 disabled={saving}
 className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
 title="Save"
 >
 <Save className="w-4 h-4" />
 </button>
 <button
 onClick={() => setEditingId(null)}
 className="p-1.5 text-gray-900 hover:bg-gray-100 rounded transition-colors"
 title="Cancel"
 >
 <X className="w-4 h-4" />
 </button>
 </>
 ) : (
 <>
 <button
 onClick={() => setEditingId(item.id)}
 className="px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors"
 >
 Edit
 </button>
 <button
 onClick={() => handleDelete(item.id, item._id)}
 className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
 title="Delete"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
 <div className="text-sm text-gray-900">
 Showing {filteredItems.length} of {rateItems.length} items
 </div>
 <button
 onClick={onClose}
 className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
 >
 Close
 </button>
 </div>
 </div>
 </div>
 </div>
 )
}
