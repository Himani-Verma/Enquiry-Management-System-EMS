'use client'

import React from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'
import RateListManager from '@/components/RateListManager'

export default function RatesPage() {
 const { user } = useAuth()

 return (
 <AuthGuard allowedRoles={['admin']}>
 <div className="flex h-screen bg-gray-50">
 <Sidebar userRole="admin" userName={user?.name} />
 
 <div className="flex-1 flex flex-col overflow-hidden">
 <DashboardHeader userRole="admin" userName={user?.name} />
 
 <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
 <div className="max-w-7xl mx-auto p-6">

 
 <RateListManager />
 </div>
 </main>
 </div>
 </div>
 </AuthGuard>
 )
}