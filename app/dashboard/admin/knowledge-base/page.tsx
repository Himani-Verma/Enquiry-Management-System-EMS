'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import FAQManager from '@/components/admin/FAQManager';
import ArticleManager from '@/components/admin/ArticleManager';
import LinkManager from '@/components/admin/LinkManager';
import { Search, BookOpen, FileText, Link as LinkIcon } from 'lucide-react';

type TabType = 'faqs' | 'articles' | 'links';

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<TabType>('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const tabs = [
    { id: 'faqs' as TabType, label: 'FAQs', icon: BookOpen },
    { id: 'articles' as TabType, label: 'Articles', icon: FileText },
    { id: 'links' as TabType, label: 'Links', icon: LinkIcon },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="admin" />
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader userRole="admin" />
          
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Base Management</h1>
              <p className="text-gray-600">Manage FAQs, articles, and external links for your chatbot</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                          flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                          ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Search and Filter Bar */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${activeTab}...`}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category Filter */}
                  {(activeTab === 'faqs' || activeTab === 'links') && (
                    <div className="sm:w-64">
                      <select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        <option value="General">General</option>
                        <option value="Technical">Technical</option>
                        <option value="Billing">Billing</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>
                  )}

                  {/* Tag Filter for Articles */}
                  {activeTab === 'articles' && (
                    <div className="sm:w-64">
                      <input
                        type="text"
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                        placeholder="Filter by tag..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Clear Filters */}
                  {(searchQuery || selectedCategory) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory(null);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              {activeTab === 'faqs' && (
                <FAQManager
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              )}

              {activeTab === 'articles' && (
                <ArticleManager
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              )}

              {activeTab === 'links' && (
                <LinkManager
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              )}
            </div>
          </div>
        </main>
      </div>
  );
}
