'use client'

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'

interface RateItem {
  _id?: string
  id: number
  group: string
  testParameter: string
  rate: number
}

interface RateListViewerProps {
  isOpen: boolean
  onClose: () => void
}

export default function RateListViewer({ isOpen, onClose }: RateListViewerProps) {
  const [rateItems, setRateItems] = useState<RateItem[]>([])
  const [filteredItems, setFilteredItems] = useState<RateItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [groups, setGroups] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchRateItems()
      fetchGroups()
    }
  }, [isOpen])

  useEffect(() => {
    let filtered = rateItems

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.testParameter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.group.toLowerCase().includes(searchQuery.toLowerCase())
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0" onClick={onClose} />
        
        <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  📋 Rate List
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  View test parameters and rates
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

          {/* Filters */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Groups</option>
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>

              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search test parameters or groups..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery || selectedGroup ? 'No items found matching your filters' : 'No rate items available'}
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.group}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.testParameter}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">₹{item.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
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
