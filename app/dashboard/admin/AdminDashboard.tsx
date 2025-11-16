'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import PendingApprovalNotification from '@/components/PendingApprovalNotification';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { getRolePermissions, getDashboardTitle, getDashboardDescription } from '@/lib/utils/roleBasedAccess';

// Analytics data layer
import { getSummary, getDaily, getRecent, getActive, Summary, DailyPoint, RecentItem, REFRESH_MS } from '@/lib/analytics';

// Real-time hooks
import { useRealtime, useRealtimeListener } from '@/hooks/useRealtime';

// Admin components
import StatCard from '@/components/admin/StatCard';
import VisitorTrendsChart from '@/components/admin/VisitorTrendsChart';
import EnhancedDailyVisitorsChart from '@/components/EnhancedDailyVisitorsChart';
import DonutGauge from '@/components/admin/DonutGauge';
import RecentList from '@/components/admin/RecentList';

export default function AdminDashboard() {
 const router = useRouter();
 const { token, user: authUser, isAuthenticated } = useAuth();
 
 // Pending approvals notification
 const { pendingCount } = usePendingApprovals();
 
 // State management
 const [summary, setSummary] = useState<Summary | null>(null);
 const [dailyData, setDailyData] = useState<DailyPoint[]>([]);
 const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
 const [activeItems, setActiveItems] = useState<RecentItem[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
 const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);

 // Set user data when authUser changes
 useEffect(() => {
 if (authUser) {
 setUser({
 id: authUser.id,
 name: authUser.name,
 role: authUser.role
 });
 }
 }, [authUser]);

 // Data fetching function
 const fetchData = useCallback(async () => {
 if (!token) return;

 try {
 setLoading(true);
 setError(null);

 const [summaryData, dailyDataResult, recentData, activeData] = await Promise.all([
 getSummary(),
 getDaily(),
 getRecent(5),
 getActive(5)
 ]);

 console.log('📊 AdminDashboard - Daily data received:', dailyDataResult);
 console.log('📊 AdminDashboard - Daily data length:', dailyDataResult?.length);
 console.log('📊 AdminDashboard - Summary data:', summaryData);

 setSummary(summaryData);
 setDailyData(dailyDataResult);
 setRecentItems(recentData);
 setActiveItems(activeData);
 setLastUpdated(new Date());
 } catch (err) {
 console.error('Failed to fetch dashboard data:', err);
 setError('Failed to load dashboard data');
 } finally {
 setLoading(false);
 }
 }, [token]);

 // Real-time event handler
 const handleRealtimeEvent = useCallback((event: string, data?: any) => {
 console.log('Real-time event received:', event, data);
 // Refetch data when real-time events occur
 fetchData();
 }, [fetchData]);

 // Set up real-time connections
 useRealtime(handleRealtimeEvent);
 useRealtimeListener(handleRealtimeEvent);

 // Initial data fetch
 useEffect(() => {
 fetchData();
 }, [fetchData]);

 // Real-time polling
 useEffect(() => {
 const interval = setInterval(() => {
 fetchData();
 }, REFRESH_MS);

 return () => clearInterval(interval);
 }, [fetchData]);

 // Get role-based permissions
 const permissions = user ? getRolePermissions(user) : null;
 const dashboardTitle = user ? getDashboardTitle(user) : 'Dashboard';
 const dashboardDescription = user ? getDashboardDescription(user) : 'Welcome to your dashboard';

 // Format last updated time in IST
 const formatLastUpdated = (date: Date): string => {
 return new Intl.DateTimeFormat("en-IN", {
 timeZone: "Asia/Kolkata",
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 second: '2-digit'
 }).format(date);
 };

 // Loading state
 if (loading && !summary) {
 return (
 <AuthGuard>
 {/* Pending Approval Notification */}
 <PendingApprovalNotification 
 pendingCount={pendingCount}
 onViewPending={() => router.push('/dashboard/admin/agents')}
 />
 
 <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
 <Sidebar userRole={(user?.role as 'admin' | 'executive' | 'sales-executive' | 'customer-executive') || 'admin'} />
 <div className="flex-1 flex flex-col">
 <DashboardHeader userRole={(user?.role as 'admin' | 'executive' | 'sales-executive' | 'customer-executive') || 'admin'} />
 <div className="flex-1 p-6">
 <div className="flex items-center justify-center h-64">
 <div className="text-center">
 <div className="relative">
 <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
 </div>
 <p className="text-gray-900 font-medium">Loading dashboard...</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </AuthGuard>
 );
 }

 return (
 <AuthGuard>
 <div className="flex h-screen bg-gray-50">
 <Sidebar userRole={(user?.role as 'admin' | 'executive' | 'sales-executive' | 'customer-executive') || 'admin'} />
 <main className="flex-1 overflow-y-auto">
 <DashboardHeader userRole={(user?.role as 'admin' | 'executive' | 'sales-executive' | 'customer-executive') || 'admin'} />
 <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

 {/* Header */}
 <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
 <div>
 <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight">
 Admin Dashboard
 </h1>
 <p className="text-base text-gray-700 font-medium">System Overview & Performance Metrics</p>
 </div>
 <div className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-sm transition-all duration-200 hover:scale-105">
 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
 <span className="text-xs text-gray-800">
 Last updated: {formatLastUpdated(lastUpdated)}
 </span>
 </div>
 </div>

 {/* Statistics Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 {/* Total Visitors */}
 <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 hover:scale-[1.02] cursor-pointer">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <p className="text-gray-600 text-xs font-medium mb-0.5">Total Visitors</p>
 <p className="text-3xl font-bold text-gray-900">{summary?.totalVisitors || 0}</p>
 {summary?.totalVisitors && (
 <div className="flex items-center mt-1 text-xs text-green-600">
 <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
 </svg>
 <span>+12% this week</span>
 </div>
 )}
 </div>
 <div className="bg-blue-50 p-3 rounded-lg">
 <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
 </svg>
 </div>
 </div>
 </div>

 {/* Leads Acquired */}
 <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 hover:scale-[1.02] cursor-pointer">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <p className="text-gray-600 text-xs font-medium mb-0.5">Leads Acquired</p>
 <p className="text-3xl font-bold text-gray-900">{summary?.leads || 0}</p>
 {summary?.leads && (
 <div className="flex items-center mt-1 text-xs text-green-600">
 <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
 </svg>
 <span>+8% this week</span>
 </div>
 )}
 </div>
 <div className="bg-green-50 p-3 rounded-lg">
 <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 </div>
 </div>

 {/* Chatbot Enquiries */}
 <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 hover:scale-[1.02] cursor-pointer">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <p className="text-gray-600 text-xs font-medium mb-0.5">Chatbot Enquiries</p>
 <p className="text-3xl font-bold text-gray-900">{summary?.chatbotEnquiries || 0}</p>
 <p className="text-xs text-gray-500 mt-0.5">{summary?.chatbotEnquiries || 0}</p>
 </div>
 <div className="bg-purple-50 p-3 rounded-lg">
 <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
 </svg>
 </div>
 </div>
 </div>

 {/* Enquiry Received */}
 <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 hover:scale-[1.02] cursor-pointer">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <p className="text-gray-600 text-xs font-medium mb-0.5">Enquiry Received</p>
 <p className="text-3xl font-bold text-gray-900">{summary?.pendingConversations || 0}</p>
 <p className="text-xs text-gray-500 mt-0.5">{summary?.pendingConversations || 0}</p>
 </div>
 <div className="bg-orange-50 p-3 rounded-lg">
 <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
 </svg>
 </div>
 </div>
 </div>
 </div>

 {/* Charts Row */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
 {/* Daily Visitors Chart */}
 <div className="lg:col-span-2">
 <EnhancedDailyVisitorsChart
 data={dailyData.map(item => ({
 date: item.date,
 visitors: item.visitors
 }))}
 title="Daily Visitors"
 subtitle="Last 7 days trend"
 height={400}
 color="blue"
 showStats={true}
 />
 </div>
 
 {/* Conversion Rate Gauge */}
 <div className="lg:col-span-1">
 <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 h-full flex flex-col" style={{ minHeight: '400px' }}>
 <div className="mb-4">
 <h3 className="text-lg font-bold text-gray-900">Conversion Rate</h3>
 <p className="text-sm text-gray-900">Overall performance</p>
 </div>
 <div className="flex-1 flex items-center justify-center">
 <DonutGauge
 value={summary?.conversionRate || 0}
 label="Converted"
 height={200}
 />
 </div>
 </div>
 </div>
 </div>

 {/* Recent Activity Row */}
 <div className="grid grid-cols-1 gap-6">
 <div>
 <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 hover-lift cursor-pointer">
 <RecentList 
 items={recentItems} 
 title="Recent Visitors" 
 />
 </div>
 </div>
 </div>

 {/* Error Display */}
 {error && (
 <div className="mt-6 bg-destructive/10 border border-destructive/20 rounded-xl p-4 animate-slide-up">
 <div className="flex items-center">
 <div className="text-destructive mr-3">⚠️</div>
 <div>
 <h4 className="text-sm font-medium text-destructive">Error Loading Data</h4>
 <p className="text-sm text-destructive/80 mt-1">{error}</p>
 <button
 onClick={fetchData}
 className="mt-2 text-sm text-destructive hover:text-destructive/80 underline transition-colors duration-200"
 >
 Try again
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 </main>
 </div>
 </AuthGuard>
 );
}
