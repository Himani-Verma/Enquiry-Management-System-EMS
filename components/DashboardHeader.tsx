'use client';
import React, { useState, useEffect } from 'react';


interface DashboardHeaderProps {
 userRole: 'admin' | 'executive' | 'sales-executive' | 'customer-executive';
 userName?: string;
}

export default function DashboardHeader({ userRole, userName }: DashboardHeaderProps) {
 const [currentTime, setCurrentTime] = useState<Date | null>(null);
 const [isClient, setIsClient] = useState(false);
 const [showProfileMenu, setShowProfileMenu] = useState(false);
 const [mounted, setMounted] = useState(false);


 useEffect(() => {
 setMounted(true);
 }, []);

 useEffect(() => {
 // Set isClient to true after hydration
 setIsClient(true);
 setCurrentTime(new Date());
 
 const timer = setInterval(() => {
 setCurrentTime(new Date());
 }, 1000);

 return () => clearInterval(timer);
 }, []);

 const getGreeting = () => {
 if (!currentTime) return 'Welcome';
 const hour = currentTime.getHours();
 if (hour < 12) return 'Good Morning';
 if (hour < 17) return 'Good Afternoon';
 return 'Good Evening';
 };

 const formatTime = (date: Date) => {
 return date.toLocaleTimeString('en-US', {
 hour: '2-digit',
 minute: '2-digit',
 second: '2-digit',
 hour12: true
 });
 };

 const formatDate = (date: Date) => {
 return date.toLocaleDateString('en-US', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 });
 };

 return (
 <div className="bg-white border-b border-gray-200 shadow-sm pr-6 pl-2 py-3 md:mt-0 mt-12 transition-all duration-300">
 <div className="flex justify-between items-center">
 <div className="flex-1 min-w-0">
 <h1 className="text-2xl font-bold text-[#022a7a] truncate tracking-tight">
 {getGreeting()}, {userName || userRole}
 </h1>
 {isClient && currentTime ? (
 <p className="text-sm text-gray-600 mt-1 truncate font-medium">
 {formatDate(currentTime)} • {formatTime(currentTime)}
 </p>
 ) : (
 <p className="text-sm text-gray-600 mt-1">
 Loading...
 </p>
 )}
 </div>

 <div className="flex items-center space-x-2 flex-shrink-0 ml-4">


 {/* Profile Menu */}
 <div className="relative">
 <button
 onClick={() => setShowProfileMenu(!showProfileMenu)}
 className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg px-2 py-1.5 transition-all duration-200"
 >
 <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
 {userName ? userName.charAt(0).toUpperCase() : (userRole ? userRole.charAt(0).toUpperCase() : 'U')}
 </div>
 <span className="hidden sm:inline text-xs font-medium text-gray-900 truncate max-w-20">
 {userName || userRole || 'User'}
 </span>
 <svg 
 className={`w-3 h-3 text-gray-900 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
 fill="none" 
 stroke="currentColor" 
 viewBox="0 0 24 24"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </button>

 {showProfileMenu && (
 <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-scale-in">
 <div className="py-1">
 <button
 onClick={() => {
 setShowProfileMenu(false);
 window.location.href = userRole === 'admin' 
 ? '/dashboard/admin/settings' 
 : '/dashboard/executive/profile';
 }}
 className="flex items-center w-full px-3 py-2 text-xs text-gray-900 hover:bg-gray-100 transition-colors duration-200"
 >
 <span className="mr-2">👤</span>
 View Profile
 </button>
 <button
 onClick={() => {
 setShowProfileMenu(false);
 window.location.href = userRole === 'admin' 
 ? '/dashboard/admin/settings' 
 : '/dashboard/executive/profile';
 }}
 className="flex items-center w-full px-3 py-2 text-xs text-gray-900 hover:bg-gray-100 transition-colors duration-200"
 >
 <span className="mr-2">⚙️</span>
 Settings
 </button>
 <hr className="my-1 border-gray-200" />
 <button
 onClick={() => {
 localStorage.removeItem('ems_token');
 localStorage.removeItem('ems_user');
 window.location.href = '/login';
 }}
 className="flex items-center w-full px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors duration-200"
 >
 <span className="mr-2">🚪</span>
 Logout
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
