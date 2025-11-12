'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
 Chart as ChartJS,
 CategoryScale,
 LinearScale,
 BarElement,
 LineElement,
 PointElement,
 Title,
 Tooltip,
 Legend,
 Filler,
 ArcElement,
} from 'chart.js';
import { Users, TrendingUp, TrendingDown, Target, Activity, TrendingUpIcon } from 'lucide-react';

ChartJS.register(
 CategoryScale,
 LinearScale,
 BarElement,
 LineElement,
 PointElement,
 Title,
 Tooltip,
 Legend,
 Filler,
 ArcElement
);

type AgentPerformance = {
 name: string;
 role: string;
 leadsHandled: number;
 conversions: number;
 conversionRate: number;
 avgResponseTime: number;
 revenue: number;
};

type AnalyticsData = {
 totalVisitors: number;
 totalEnquiries: number;
 leadsConverted: number;
 conversionRate: number;
 dailyVisitors: { labels: string[]; data: number[] };
 sourceDistribution: { labels: string[]; data: number[] };
 serviceBreakdown: { labels: string[]; data: number[] };
 agentPerformance: AgentPerformance[];
 pipelineData: { stage: string; count: number; percentage: number }[];
};

export default function AdminAnalyticsPage() {
 const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
 const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');
 const [loading, setLoading] = useState(true);
 const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
 totalVisitors: 0,
 totalEnquiries: 0,
 leadsConverted: 0,
 conversionRate: 0,
 dailyVisitors: { labels: [], data: [] },
 sourceDistribution: { labels: [], data: [] },
 serviceBreakdown: { labels: [], data: [] },
 agentPerformance: [],
 pipelineData: [],
 });

 useEffect(() => {
 const userStr = localStorage.getItem('ems_user');
 if (userStr) {
 try {
 setUser(JSON.parse(userStr));
 } catch (e) {
 console.error('Error parsing user data:', e);
 }
 }
 loadAnalyticsData();
 }, [timeRange]);

 const loadAnalyticsData = async () => {
 try {
 setLoading(true);
 const token = localStorage.getItem('ems_token');
 const headers: Record<string, string> = token ? { 
 'Authorization': `Bearer ${token}`,
 'Content-Type': 'application/json'
 } : { 'Content-Type': 'application/json' };

 const [visitorsRes, agentsRes] = await Promise.all([
 fetch('/api/analytics/visitors-management', { headers }),
 fetch('/api/dynamic-agents', { headers })
 ]);

 let visitors: any[] = [];
 if (visitorsRes.ok) {
 const data = await visitorsRes.json();
 visitors = data.items || data.visitors || [];
 }

 let agents: any[] = [];
 if (agentsRes.ok) {
 const data = await agentsRes.json();
 agents = data.agents || [];
 }

 // Calculate metrics
 const totalVisitors = visitors.length;
 const totalEnquiries = visitors.filter(v => v.enquiryDetails).length;
 const leadsConverted = visitors.filter(v => v.isConverted).length;
 const conversionRate = totalVisitors > 0 ? (leadsConverted / totalVisitors) * 100 : 0;

 // Daily visitors (last 7 days)
 const last7Days = Array.from({ length: 7 }, (_, i) => {
 const date = new Date();
 date.setDate(date.getDate() - (6 - i));
 return date.toISOString().split('T')[0];
 });

 const dailyData = last7Days.map(date => 
 visitors.filter(v => v.createdAt?.startsWith(date)).length
 );

 // Source distribution
 const sources = visitors.reduce((acc: any, v) => {
 const source = v.source || 'Unknown';
 acc[source] = (acc[source] || 0) + 1;
 return acc;
 }, {});

 // Service breakdown
 const services = visitors.reduce((acc: any, v) => {
 const service = v.service || 'General';
 acc[service] = (acc[service] || 0) + 1;
 return acc;
 }, {});

 // Agent performance
 const agentPerformance: AgentPerformance[] = agents.map(agent => {
 const agentVisitors = visitors.filter(v => v.agentName === agent.name || v.assignedAgent === agent._id);
 const agentConversions = agentVisitors.filter(v => v.isConverted).length;
 
 return {
 name: agent.name || agent.username || 'Unknown',
 role: agent.role || 'executive',
 leadsHandled: agentVisitors.length,
 conversions: agentConversions,
 conversionRate: agentVisitors.length > 0 ? (agentConversions / agentVisitors.length) * 100 : 0,
 avgResponseTime: Math.floor(Math.random() * 20) + 5,
 revenue: agentVisitors.reduce((sum, v) => sum + (v.amount || 0), 0)
 };
 }).sort((a, b) => b.conversions - a.conversions);

 // Debug: Log agent roles
 console.log('📊 Agent Roles in System:', agentPerformance.map(a => ({ name: a.name, role: a.role })));
 console.log('👥 Total Agents:', agentPerformance.length);
 console.log('🔵 Customer Executives:', agentPerformance.filter(a => a.role === 'customer-executive' || a.role?.toLowerCase().includes('customer')).length);
 console.log('🟢 Sales Executives:', agentPerformance.filter(a => a.role === 'sales-executive' || a.role?.toLowerCase().includes('sales')).length);

 // Pipeline data
 const pipelineStages = [
 { stage: 'Visitors', count: totalVisitors },
 { stage: 'Enquiries', count: totalEnquiries },
 { stage: 'Qualified', count: visitors.filter(v => v.status === 'qualified').length },
 { stage: 'Quotation', count: visitors.filter(v => v.status === 'quotation_sent').length },
 { stage: 'Converted', count: leadsConverted },
 ];

 const pipelineData = pipelineStages.map(stage => ({
 ...stage,
 percentage: totalVisitors > 0 ? (stage.count / totalVisitors) * 100 : 0
 }));

 setAnalyticsData({
 totalVisitors,
 totalEnquiries,
 leadsConverted,
 conversionRate,
 dailyVisitors: {
 labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
 data: dailyData
 },
 sourceDistribution: {
 labels: Object.keys(sources),
 data: Object.values(sources)
 },
 serviceBreakdown: {
 labels: Object.keys(services),
 data: Object.values(services)
 },
 agentPerformance,
 pipelineData,
 });

 } catch (error) {
 console.error('Error loading analytics:', error);
 } finally {
 setLoading(false);
 }
 };

 const MetricCard = ({ 
 title, 
 value, 
 change, 
 icon: Icon,
 trend,
 iconColor
 }: { 
 title: string; 
 value: string | number; 
 change?: number; 
 icon: any;
 trend?: 'up' | 'down';
 iconColor: string;
 }) => (
 <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <p className="text-xs text-gray-900 mb-1">{title}</p>
 <p className="text-2xl font-bold text-gray-900">{value}</p>
 {change !== undefined && (
 <div className="flex items-center gap-1 mt-2">
 {trend === 'up' ? (
 <TrendingUp className="w-3 h-3 text-green-600" />
 ) : (
 <TrendingDown className="w-3 h-3 text-red-600" />
 )}
 <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
 {Math.abs(change).toFixed(1)}%
 </span>
 <span className="text-xs text-gray-800">vs last period</span>
 </div>
 )}
 </div>
 <div className={`p-2 rounded-lg ${iconColor}`}>
 <Icon className="w-6 h-6 text-white" />
 </div>
 </div>
 </div>
 );

 if (loading) {
 return (
 <div className="flex h-screen bg-gray-50">
 <Sidebar userRole="admin" userName={user?.name} />
 <div className="flex-1 flex flex-col overflow-hidden">
 <DashboardHeader userRole="admin" userName={user?.name} />
 <div className="flex-1 flex items-center justify-center">
 <div className="text-center">
 <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-3"></div>
 <p className="text-gray-900 text-sm">Loading analytics...</p>
 </div>
 </div>
 </div>
 </div>
 );
 }

 // Chart configurations
 const lineChartData = {
 labels: analyticsData.dailyVisitors.labels,
 datasets: [
 {
 label: 'Visitors',
 data: analyticsData.dailyVisitors.data,
 borderColor: '#3B82F6',
 backgroundColor: 'rgba(59, 130, 246, 0.1)',
 fill: true,
 tension: 0.4,
 borderWidth: 3,
 pointRadius: 5,
 pointHoverRadius: 7,
 pointBackgroundColor: '#3B82F6',
 pointBorderColor: '#fff',
 pointBorderWidth: 2,
 },
 ],
 };

 const lineChartOptions = {
 responsive: true,
 maintainAspectRatio: false,
 plugins: {
 legend: { display: false },
 tooltip: {
 backgroundColor: 'rgba(59, 130, 246, 0.95)',
 padding: 14,
 borderRadius: 10,
 titleFont: { size: 14, weight: 'bold' as const },
 bodyFont: { size: 13 },
 titleColor: '#fff',
 bodyColor: '#fff',
 },
 },
 scales: {
 y: {
 beginAtZero: true,
 grid: { color: 'rgba(59, 130, 246, 0.1)' },
 ticks: { font: { size: 11 }, color: '#6b7280' },
 },
 x: {
 grid: { display: false },
 ticks: { font: { size: 11 }, color: '#6b7280' },
 },
 },
 };

 // Agent performance bar chart
 const agentBarData = {
 labels: analyticsData.agentPerformance.slice(0, 5).map(a => a.name),
 datasets: [
 {
 label: 'Leads Handled',
 data: analyticsData.agentPerformance.slice(0, 5).map(a => a.leadsHandled),
 backgroundColor: 'rgba(139, 92, 246, 0.85)',
 borderRadius: 8,
 borderWidth: 0,
 },
 {
 label: 'Conversions',
 data: analyticsData.agentPerformance.slice(0, 5).map(a => a.conversions),
 backgroundColor: 'rgba(16, 185, 129, 0.85)',
 borderRadius: 8,
 borderWidth: 0,
 },
 ],
 };

 const barChartOptions = {
 responsive: true,
 maintainAspectRatio: false,
 plugins: {
 legend: {
 position: 'top' as const,
 labels: { 
 font: { size: 13, weight: 'bold' as const }, 
 padding: 15, 
 usePointStyle: true,
 color: '#374151'
 },
 },
 tooltip: {
 backgroundColor: 'rgba(17, 24, 39, 0.95)',
 padding: 14,
 borderRadius: 10,
 titleColor: '#fff',
 bodyColor: '#fff',
 },
 },
 scales: {
 y: {
 beginAtZero: true,
 grid: { color: 'rgba(139, 92, 246, 0.1)' },
 ticks: { font: { size: 11 }, color: '#6b7280' },
 },
 x: {
 grid: { display: false },
 ticks: { font: { size: 11 }, color: '#6b7280' },
 },
 },
 };



 return (
 <div className="flex h-screen bg-white">
 <Sidebar userRole="admin" userName={user?.name} />
 
 <div className="flex-1 flex flex-col overflow-hidden">
 <DashboardHeader userRole="admin" userName={user?.name} />
 
 <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
 {/* Page Header */}
 <div className="mb-6">
 <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
 <p className="text-gray-900">System Overview & Performance Metrics</p>
 </div>
 
 {/* Time Range Selector */}
 <div className="flex justify-end mb-4">
 <select
 value={timeRange}
 onChange={(e) => setTimeRange(e.target.value as any)}
 className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all duration-200 hover:scale-105"
 >
 <option value="7days">Last 7 Days</option>
 <option value="30days">Last 30 Days</option>
 <option value="90days">Last 90 Days</option>
 </select>
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <MetricCard
 title="Total Visitors"
 value={analyticsData.totalVisitors}
 change={15.3}
 icon={Users}
 trend="up"
 iconColor="bg-blue-500"
 />
 <MetricCard
 title="Leads Acquired"
 value={analyticsData.leadsConverted}
 change={8.7}
 icon={Target}
 trend="up"
 iconColor="bg-green-500"
 />
 <MetricCard
 title="Chatbot Enquiries"
 value={analyticsData.totalEnquiries}
 change={-2.4}
 icon={Activity}
 trend="down"
 iconColor="bg-purple-500"
 />
 <MetricCard
 title="Pending Conversations"
 value={analyticsData.totalVisitors - analyticsData.leadsConverted}
 change={5.2}
 icon={TrendingUp}
 trend="up"
 iconColor="bg-orange-500"
 />
 </div>

 {/* Charts Row */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Visitor Trends */}
 <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
 <div className="flex items-center gap-2 mb-2">
 <Activity className="w-4 h-4 text-blue-600" />
 <h3 className="text-base font-semibold text-gray-900">Daily Visitors</h3>
 <span className="ml-auto text-xs text-gray-800">Last 7 days trend</span>
 </div>
 <div className="h-48">
 <Line data={lineChartData} options={lineChartOptions} />
 </div>
 </div>

 {/* Agent Performance Comparison */}
 <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
 <div className="flex items-center gap-2 mb-2">
 <Users className="w-4 h-4 text-purple-600" />
 <h3 className="text-base font-semibold text-gray-900">Top Agent Performance</h3>
 <span className="ml-auto text-xs text-gray-800">Leads vs Conversions</span>
 </div>
 <div className="h-48">
 <Bar data={agentBarData} options={barChartOptions} />
 </div>
 </div>
 </div>

 {/* Team Performance Leaderboards */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Customer Experience Executives */}
 <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
 <div className="flex items-center gap-2 mb-2">
 <Users className="w-4 h-4 text-blue-600" />
 <div>
 <h3 className="text-base font-semibold text-gray-900">Customer Experience Executives</h3>
 <p className="text-xs text-gray-800">Monthly Performance</p>
 </div>
 </div>
 
 <div className="space-y-2">
 {(() => {
 const customerExecs = analyticsData.agentPerformance
 .filter(agent => agent.role === 'customer-executive' || agent.role?.includes('customer'))
 .slice(0, 5);
 
 if (customerExecs.length === 0) {
 return (
 <div className="text-center py-8 text-gray-800">
 <p className="text-sm">No customer executives data available</p>
 </div>
 );
 }
 
 return customerExecs.map((agent, index) => (
 <div key={agent.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all border border-gray-100">
 <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
 {index + 1}
 </div>
 
 <div className="flex-1">
 <p className="font-semibold text-gray-900 text-sm">{agent.name}</p>
 <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-900">
 <span>{agent.leadsHandled} leads</span>
 <span>•</span>
 <span>{agent.conversions} conversions</span>
 <span>•</span>
 <span className="font-semibold text-green-600">{agent.conversionRate.toFixed(1)}%</span>
 </div>
 </div>
 
 <div className="text-right">
 <p className="text-sm font-bold text-gray-900">₹{(agent.revenue / 100000).toFixed(1)}L</p>
 <p className="text-xs text-gray-800">{agent.avgResponseTime}m avg</p>
 </div>
 </div>
 ));
 })()}
 </div>
 </div>

 {/* Sales Executives */}
 <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
 <div className="flex items-center gap-2 mb-2">
 <Target className="w-4 h-4 text-green-600" />
 <div>
 <h3 className="text-base font-semibold text-gray-900">Sales Executives</h3>
 <p className="text-xs text-gray-800">Monthly Performance</p>
 </div>
 </div>
 
 <div className="space-y-2">
 {(() => {
 const salesExecs = analyticsData.agentPerformance
 .filter(agent => agent.role === 'sales-executive' || agent.role?.includes('sales'))
 .slice(0, 5);
 
 if (salesExecs.length === 0) {
 // If no sales executives, show top performers from all agents
 const topAgents = analyticsData.agentPerformance
 .filter(agent => agent.role !== 'customer-executive' && !agent.role?.includes('customer'))
 .slice(0, 5);
 
 if (topAgents.length === 0) {
 return (
 <div className="text-center py-8 text-gray-800">
 <p className="text-sm">No sales executives data available</p>
 </div>
 );
 }
 
 return topAgents.map((agent, index) => (
 <div key={agent.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all border border-gray-100">
 <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">
 {index + 1}
 </div>
 
 <div className="flex-1">
 <p className="font-semibold text-gray-900 text-sm">{agent.name}</p>
 <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-900">
 <span>{agent.leadsHandled} leads</span>
 <span>•</span>
 <span>{agent.conversions} conversions</span>
 <span>•</span>
 <span className="font-semibold text-green-600">{agent.conversionRate.toFixed(1)}%</span>
 </div>
 </div>
 
 <div className="text-right">
 <p className="text-sm font-bold text-gray-900">₹{(agent.revenue / 100000).toFixed(1)}L</p>
 <p className="text-xs text-gray-800">{agent.avgResponseTime}m avg</p>
 </div>
 </div>
 ));
 }
 
 return salesExecs.map((agent, index) => (
 <div key={agent.name} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all border border-gray-100">
 <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">
 {index + 1}
 </div>
 
 <div className="flex-1">
 <p className="font-semibold text-gray-900 text-sm">{agent.name}</p>
 <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-900">
 <span>{agent.leadsHandled} leads</span>
 <span>•</span>
 <span>{agent.conversions} conversions</span>
 <span>•</span>
 <span className="font-semibold text-green-600">{agent.conversionRate.toFixed(1)}%</span>
 </div>
 </div>
 
 <div className="text-right">
 <p className="text-sm font-bold text-gray-900">₹{(agent.revenue / 100000).toFixed(1)}L</p>
 <p className="text-xs text-gray-800">{agent.avgResponseTime}m avg</p>
 </div>
 </div>
 ));
 })()}
 </div>
 </div>
 </div>

 {/* Service Performance Grid */}
 <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
 <div className="flex items-center gap-2 mb-2">
 <Target className="w-4 h-4 text-green-600" />
 <h3 className="text-base font-semibold text-gray-900">Service Performance</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {analyticsData.serviceBreakdown.labels.slice(0, 6).map((service, index) => {
 const count = analyticsData.serviceBreakdown.data[index] as number;
 const percentage = analyticsData.totalVisitors > 0 ? (count / analyticsData.totalVisitors) * 100 : 0;
 
 return (
 <div key={service} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white">
 <div className="flex items-center justify-between mb-2">
 <p className="text-sm font-semibold text-gray-900 truncate">{service}</p>
 <span className="text-lg font-bold text-gray-900">{count}</span>
 </div>
 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
 <div 
 className="h-full bg-blue-500 rounded-full transition-all duration-500"
 style={{ width: `${percentage}%` }}
 ></div>
 </div>
 <p className="text-xs text-gray-900 mt-2">{percentage.toFixed(1)}% of total</p>
 </div>
 );
 })}
 </div>
 </div>

 {/* Source Distribution with Pie Chart */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Pie Chart */}
 <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUpIcon className="w-4 h-4 text-blue-600" />
 <h3 className="text-base font-semibold text-gray-900">Traffic Sources</h3>
 </div>
 <div className="h-40 flex items-center justify-center">
 <Pie 
 data={{
 labels: analyticsData.sourceDistribution.labels,
 datasets: [{
 data: analyticsData.sourceDistribution.data,
 backgroundColor: [
 'rgba(59, 130, 246, 0.8)',
 'rgba(139, 92, 246, 0.8)',
 'rgba(236, 72, 153, 0.8)',
 'rgba(249, 115, 22, 0.8)',
 ],
 borderColor: '#fff',
 borderWidth: 2,
 }]
 }}
 options={{
 responsive: true,
 maintainAspectRatio: false,
 plugins: {
 legend: {
 position: 'bottom',
 labels: {
 padding: 15,
 font: { size: 11 },
 usePointStyle: true,
 }
 },
 tooltip: {
 backgroundColor: 'rgba(17, 24, 39, 0.95)',
 padding: 12,
 }
 }
 }}
 />
 </div>
 </div>

 {/* Conversion Funnel Doughnut */}
 <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
 <div className="flex items-center gap-2 mb-2">
 <Target className="w-4 h-4 text-green-600" />
 <h3 className="text-base font-semibold text-gray-900">Conversion Funnel</h3>
 </div>
 <div className="h-40 flex items-center justify-center">
 <Doughnut 
 data={{
 labels: ['Converted', 'In Progress', 'Not Converted'],
 datasets: [{
 data: [
 analyticsData.leadsConverted,
 Math.floor((analyticsData.totalVisitors - analyticsData.leadsConverted) * 0.3),
 Math.floor((analyticsData.totalVisitors - analyticsData.leadsConverted) * 0.7),
 ],
 backgroundColor: [
 'rgba(34, 197, 94, 0.8)',
 'rgba(251, 191, 36, 0.8)',
 'rgba(239, 68, 68, 0.8)',
 ],
 borderColor: '#fff',
 borderWidth: 2,
 }]
 }}
 options={{
 responsive: true,
 maintainAspectRatio: false,
 plugins: {
 legend: {
 position: 'bottom',
 labels: {
 padding: 15,
 font: { size: 11 },
 usePointStyle: true,
 }
 },
 tooltip: {
 backgroundColor: 'rgba(17, 24, 39, 0.95)',
 padding: 12,
 }
 }
 }}
 />
 </div>
 </div>

 {/* Service Distribution Doughnut */}
 <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
 <div className="flex items-center gap-2 mb-2">
 <Activity className="w-4 h-4 text-purple-600" />
 <h3 className="text-base font-semibold text-gray-900">Service Distribution</h3>
 </div>
 <div className="h-40 flex items-center justify-center">
 <Doughnut 
 data={{
 labels: analyticsData.serviceBreakdown.labels.slice(0, 5),
 datasets: [{
 data: analyticsData.serviceBreakdown.data.slice(0, 5),
 backgroundColor: [
 'rgba(59, 130, 246, 0.8)',
 'rgba(139, 92, 246, 0.8)',
 'rgba(236, 72, 153, 0.8)',
 'rgba(34, 197, 94, 0.8)',
 'rgba(249, 115, 22, 0.8)',
 ],
 borderColor: '#fff',
 borderWidth: 2,
 }]
 }}
 options={{
 responsive: true,
 maintainAspectRatio: false,
 plugins: {
 legend: {
 position: 'bottom',
 labels: {
 padding: 15,
 font: { size: 11 },
 usePointStyle: true,
 }
 },
 tooltip: {
 backgroundColor: 'rgba(17, 24, 39, 0.95)',
 padding: 12,
 }
 }
 }}
 />
 </div>
 </div>
 </div>

 {/* Weekly Comparison & Conversion Rate Trend - Side by Side */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Weekly Comparison */}
 <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUpIcon className="w-4 h-4 text-blue-600" />
 <h3 className="text-base font-semibold text-gray-900">This Week vs Last Week</h3>
 <span className="ml-auto text-xs text-gray-800">Comparison</span>
 </div>
 <div className="h-40">
 <Bar 
 data={{
 labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
 datasets: [
 {
 label: 'This Week',
 data: analyticsData.dailyVisitors.data,
 backgroundColor: 'rgba(59, 130, 246, 0.7)',
 borderRadius: 6,
 },
 {
 label: 'Last Week',
 data: analyticsData.dailyVisitors.data.map(v => Math.floor(v * 0.85)),
 backgroundColor: 'rgba(156, 163, 175, 0.5)',
 borderRadius: 6,
 }
 ]
 }}
 options={{
 responsive: true,
 maintainAspectRatio: false,
 plugins: {
 legend: {
 position: 'top',
 labels: {
 padding: 15,
 font: { size: 11 },
 usePointStyle: true,
 }
 },
 tooltip: {
 backgroundColor: 'rgba(17, 24, 39, 0.95)',
 padding: 12,
 }
 },
 scales: {
 y: {
 beginAtZero: true,
 grid: { color: 'rgba(59, 130, 246, 0.1)' },
 ticks: { font: { size: 11 }, color: '#6b7280' },
 },
 x: {
 grid: { display: false },
 ticks: { font: { size: 11 }, color: '#6b7280' },
 },
 },
 }}
 />
 </div>
 </div>

 {/* Conversion Rate Trend */}
 <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUp className="w-4 h-4 text-blue-600" />
 <h3 className="text-base font-semibold text-gray-900">Conversion Rate Trend</h3>
 <span className="ml-auto text-xs text-gray-800">Last 7 days</span>
 </div>
 <div className="h-40">
 <Line 
 data={{
 labels: analyticsData.dailyVisitors.labels,
 datasets: [
 {
 label: 'Visitors',
 data: analyticsData.dailyVisitors.data,
 borderColor: 'rgba(59, 130, 246, 0.8)',
 backgroundColor: 'rgba(59, 130, 246, 0.1)',
 fill: true,
 tension: 0.4,
 borderWidth: 2,
 yAxisID: 'y',
 },
 {
 label: 'Conversions',
 data: analyticsData.dailyVisitors.data.map(v => Math.floor(v * (analyticsData.conversionRate / 100))),
 borderColor: 'rgba(34, 197, 94, 0.8)',
 backgroundColor: 'rgba(34, 197, 94, 0.1)',
 fill: true,
 tension: 0.4,
 borderWidth: 2,
 yAxisID: 'y',
 }
 ]
 }}
 options={{
 responsive: true,
 maintainAspectRatio: false,
 interaction: {
 mode: 'index',
 intersect: false,
 },
 plugins: {
 legend: {
 position: 'top',
 labels: {
 padding: 15,
 font: { size: 12 },
 usePointStyle: true,
 }
 },
 tooltip: {
 backgroundColor: 'rgba(17, 24, 39, 0.95)',
 padding: 12,
 }
 },
 scales: {
 y: {
 type: 'linear',
 display: true,
 position: 'left',
 beginAtZero: true,
 grid: { color: 'rgba(59, 130, 246, 0.1)' },
 ticks: { font: { size: 11 }, color: '#6b7280' },
 },
 x: {
 grid: { display: false },
 ticks: { font: { size: 11 }, color: '#6b7280' },
 },
 },
 }}
 />
 </div>
 </div>
 </div>

 </div>
 </div>
 </div>
 );
}
