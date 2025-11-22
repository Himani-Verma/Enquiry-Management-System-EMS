'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';

type Visitor = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  region?: string;
  service: string;
  subservice?: string;
  enquiryDetails?: string;
  source: 'chatbot' | 'email' | 'calls' | 'website';
  createdAt: string;
  lastInteractionAt?: string;
  isConverted: boolean;
  status: string;
  agent?: string;
  agentName?: string;
  assignedAgent?: string;
  salesExecutive?: string;
  salesExecutiveName?: string;
  comments?: string;
  amount?: number;
};

export default function SalesExecutiveVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'chatbot' | 'email' | 'calls' | 'website'>('all');

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('ems_token') : null), []);
  
  // API base URL - always use current domain
  const API_BASE = (() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
  })();

  const loadVisitors = async () => {
    if (!token) {
      setError('No authentication token found. Please login again.');
      setLoading(false);
      return;
    }
    
    if (!user) {
      console.log('⏳ User not loaded yet, skipping visitors load');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Sales Executive - Loading visitors for user:', user);
      const headers = { 
        Authorization: `Bearer ${token}`,
        'X-User-Info': JSON.stringify(user)
      };
      
      // Use the visitors-management API which handles visitor data properly
      console.log('📡 Fetching from:', `${API_BASE}/api/analytics/visitors-management`);
      const response = await fetch(`${API_BASE}/api/analytics/visitors-management`, { headers });

      console.log('📊 Response status:', response.status);

      if (response.status === 401) {
        setError('Authentication failed. Please login again.');
        localStorage.removeItem('ems_token');
        localStorage.removeItem('ems_user');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to load visitors: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Sales Executive - Received visitors:', responseData);
      const visitorsList = responseData.visitors || []; // API returns visitors array
      
      // Map the API response to the frontend Visitor type
      const mappedVisitors: Visitor[] = visitorsList.map((visitor: any) => ({
        _id: visitor._id,
        name: visitor.name || 'Unknown',
        email: visitor.email || '',
        phone: visitor.phone || '',
        organization: visitor.organization || '',
        region: visitor.region || '',
        service: visitor.service || 'General Inquiry',
        subservice: visitor.subservice || '',
        enquiryDetails: visitor.enquiryDetails || 'General enquiry',
        source: (['chatbot','email','calls','website'].includes(visitor.source) ? visitor.source : 'chatbot') as Visitor['source'],
        createdAt: visitor.createdAt,
        lastInteractionAt: visitor.lastInteractionAt,
        isConverted: visitor.isConverted || false,
        status: visitor.status || 'new',
        agent: visitor.agent,
        agentName: visitor.agentName || 'Unassigned',
        assignedAgent: visitor.assignedAgent,
        salesExecutive: visitor.salesExecutive,
        salesExecutiveName: visitor.salesExecutiveName || '',
        comments: visitor.comments || '',
        amount: visitor.amount || 0
      }));
      
      setVisitors(mappedVisitors);

    } catch (e: any) {
      console.error('❌ Error loading visitors:', e);
      const errorMessage = e.message || 'Failed to load visitors';
      setError(`Unable to load visitors: ${errorMessage}. Please check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem('ems_user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Only load data after user is set
    if (!user) {
      console.log('⏳ User not loaded yet, skipping data load');
      return;
    }

    loadVisitors();
  }, [API_BASE, token, user]);

  const filteredVisitors = useMemo(() => {
    if (!Array.isArray(visitors)) return [];
    if (activeTab === 'all') return visitors;
    return visitors.filter(visitor => visitor.source === activeTab);
  }, [visitors, activeTab]);

  const visitorStats = useMemo(() => {
    if (!Array.isArray(visitors)) return { chatbot: 0, email: 0, calls: 0, website: 0 };
    const chatbot = visitors.filter(v => v.source === 'chatbot').length;
    const email = visitors.filter(v => v.source === 'email').length;
    const calls = visitors.filter(v => v.source === 'calls').length;
    const website = visitors.filter(v => v.source === 'website').length;
    
    return { chatbot, email, calls, website };
  }, [visitors]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'chatbot': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'calls': return 'bg-purple-100 text-purple-800';
      case 'website': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'escalated':
        return 'bg-red-100 text-red-800';
      case 'enquiry_required':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar userRole="executive" userName={user?.name} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader userRole="executive" userName={user?.name} />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-gray-900">Loading visitors...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar userRole="executive" userName={user?.name} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader userRole="executive" userName={user?.name} />
          <div className="flex-1 p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-600">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole="executive" userName={user?.name} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userRole="executive" userName={user?.name} />
        
        <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Visitors</h1>
                <p className="text-gray-900">Manage and track visitors assigned to you</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export
              </button>
            </div>
          </div>

          {/* Visitor Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Chatbot</h3>
                  <p className="text-3xl font-bold text-blue-600">{visitorStats.chatbot}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                  <p className="text-3xl font-bold text-green-600">{visitorStats.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Calls</h3>
                  <p className="text-3xl font-bold text-purple-600">{visitorStats.calls}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Website</h3>
                  <p className="text-3xl font-bold text-orange-600">{visitorStats.website}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visitor Type Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-800 hover:text-black hover:border-gray-300'
                  }`}
                >
                  All ({Array.isArray(visitors) ? visitors.length : 0})
                </button>
                <button
                  onClick={() => setActiveTab('chatbot')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'chatbot'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-800 hover:text-black hover:border-gray-300'
                  }`}
                >
                  Chatbot ({visitorStats.chatbot})
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'email'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-800 hover:text-black hover:border-gray-300'
                  }`}
                >
                  Email ({visitorStats.email})
                </button>
                <button
                  onClick={() => setActiveTab('calls')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'calls'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-800 hover:text-black hover:border-gray-300'
                  }`}
                >
                  Calls ({visitorStats.calls})
                </button>
                <button
                  onClick={() => setActiveTab('website')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'website'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-800 hover:text-black hover:border-gray-300'
                  }`}
                >
                  Website ({visitorStats.website})
                </button>
              </nav>
            </div>

            {/* Visitors Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Sr.no.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Name of Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Sales Executive
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Sub-service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Enquiry Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Contact no.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Email id
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Region
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVisitors.map((visitor, index) => (
                    <tr key={`visitor-${visitor._id || index}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {visitor.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.agentName || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.salesExecutiveName || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(visitor.status)}`}>
                          {visitor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(visitor.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.subservice || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {visitor.enquiryDetails || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(visitor.source)}`}>
                          {visitor.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.organization || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.region || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {visitor.comments || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.amount ? `₹${visitor.amount.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredVisitors.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No visitors found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === 'all' ? 'No visitors available.' : `No visitors from ${activeTab} source.`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}