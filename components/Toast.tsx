'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
 message: string;
 type?: 'success' | 'error' | 'info' | 'warning';
 duration?: number;
 onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
 useEffect(() => {
 const timer = setTimeout(() => {
 onClose();
 }, duration);

 return () => clearTimeout(timer);
 }, [duration, onClose]);

 const icons = {
 success: <CheckCircle className="w-5 h-5" />,
 error: <XCircle className="w-5 h-5" />,
 info: <Info className="w-5 h-5" />,
 warning: <AlertTriangle className="w-5 h-5" />
 };

 const colors = {
 success: 'bg-green-50 border-green-500 text-green-800',
 error: 'bg-red-50 border-red-500 text-red-800',
 info: 'bg-blue-50 border-blue-500 text-blue-800',
 warning: 'bg-yellow-50 border-yellow-500 text-yellow-800'
 };

 const iconColors = {
 success: 'text-green-600',
 error: 'text-red-600',
 info: 'text-blue-600',
 warning: 'text-yellow-600'
 };

 return (
 <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
 <div className={`${colors[type]} border-l-4 rounded-lg shadow-lg p-4 pr-12 max-w-md backdrop-blur-sm bg-opacity-95`}>
 <div className="flex items-start gap-3">
 <div className={iconColors[type]}>
 {icons[type]}
 </div>
 <div className="flex-1">
 <p className="text-sm font-medium">{message}</p>
 </div>
 <button
 onClick={onClose}
 className="absolute top-3 right-3 text-gray-700 hover:text-gray-900 transition-colors"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 );
}

