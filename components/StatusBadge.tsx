'use client';

import { CheckCircle, Clock, XCircle, Send, FileText, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
 status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
 size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
 const configs = {
 draft: {
 icon: <FileText className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
 color: 'bg-gray-100 text-gray-700 border-gray-300',
 label: 'Draft'
 },
 sent: {
 icon: <Send className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
 color: 'bg-blue-100 text-blue-700 border-blue-300',
 label: 'Sent'
 },
 approved: {
 icon: <CheckCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
 color: 'bg-green-100 text-green-700 border-green-300',
 label: 'Approved'
 },
 rejected: {
 icon: <XCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
 color: 'bg-red-100 text-red-700 border-red-300',
 label: 'Rejected'
 },
 expired: {
 icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />,
 color: 'bg-orange-100 text-orange-700 border-orange-300',
 label: 'Expired'
 }
 };

 const config = configs[status];
 const sizeClasses = {
 sm: 'px-2 py-0.5 text-xs',
 md: 'px-3 py-1 text-xs',
 lg: 'px-4 py-1.5 text-sm'
 };

 return (
 <span className={`inline-flex items-center gap-1.5 ${config.color} ${sizeClasses[size]} rounded-full font-semibold border`}>
 {config.icon}
 <span>{config.label}</span>
 </span>
 );
}

