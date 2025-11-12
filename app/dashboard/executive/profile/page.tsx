'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import UserProfileEditor from '@/components/UserProfileEditor';

export default function ExecutiveProfilePage() {
 const [user, setUser] = useState<{ name: string; role: string } | null>(null);
 const [token, setToken] = useState<string | null>(null);
 const router = useRouter();

 useEffect(() => {
 // Check authentication
 if (typeof window !== 'undefined') {
 const storedToken = localStorage.getItem('ems_token');
 const storedUser = localStorage.getItem('ems_user');

 if (!storedToken || !storedUser) {
 router.push('/login');
 return;
 }

 try {
 const userData = JSON.parse(storedUser);
 if (!['sales-executive', 'customer-executive'].includes(userData.role)) {
 router.push('/dashboard/' + userData.role);
 return;
 }
 
 setUser(userData);
 setToken(storedToken);
 } catch (error) {
 console.error('Error parsing user data:', error);
 router.push('/login');
 }
 }
 }, [router]);

 const handleProfileUpdate = (updatedUser: any) => {
 // Update local user state
 setUser(prev => prev ? { ...prev, ...updatedUser } : null);
 
 // Update localStorage
 if (typeof window !== 'undefined') {
 localStorage.setItem('ems_user', JSON.stringify(updatedUser));
 }
 };

 if (!user || !token) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="animate-pulse">
 <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
 <div className="h-4 bg-gray-200 rounded w-32"></div>
 </div>
 </div>
 );
 }

 return (
 <div className="flex h-screen bg-gray-50">
 {/* Sidebar */}
 <Sidebar userRole={user.role as 'sales-executive' | 'customer-executive'} />
 
 {/* Main Content */}
 <div className="flex-1 ml-64 flex flex-col overflow-hidden">
 <DashboardHeader 
 userRole={user.role as 'sales-executive' | 'customer-executive'}
 userName={user.name}
 />
 
 <main className="flex-1 overflow-y-auto pr-8 py-8 pl-2">
 <div className="max-w-full">
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
 <p className="text-gray-600 mt-2">
 Manage your personal information and account settings.
 </p>
 </div>

 <UserProfileEditor 
 token={token}
 onProfileUpdate={handleProfileUpdate}
 />
 </div>
 </main>
 </div>
 </div>
 );
}
