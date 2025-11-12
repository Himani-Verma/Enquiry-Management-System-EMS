import React from 'react';

interface StatBoxProps {
 title: string;
 value: string | number;
 icon: string;
 color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
 change?: {
 value: number;
 isPositive: boolean;
 };
}

export default function StatBox({ title, value, icon, color, change }: StatBoxProps) {
 const getIconColor = (color: string) => {
 switch (color) {
 case 'blue':
 return 'text-blue-500';
 case 'green':
 return 'text-green-500';
 case 'orange':
 return 'text-orange-500';
 case 'red':
 return 'text-red-500';
 case 'purple':
 return 'text-purple-500';
 default:
 return 'text-gray-800';
 }
 };

 const getChangeColor = (isPositive: boolean) => {
 return isPositive ? 'text-green-600' : 'text-red-600';
 };

 const iconColor = getIconColor(color);

 return (
 <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <p className="text-xs text-gray-900 mb-1">{title}</p>
 <p className="text-2xl font-bold text-gray-900">{(value || 0).toLocaleString()}</p>
 {change && (
 <div className="flex items-center gap-1 mt-2">
 <span className={`text-xs font-medium ${getChangeColor(change.isPositive)}`}>
 {change.isPositive ? '↗' : '↘'} {Math.abs(change.value)}% this week
 </span>
 </div>
 )}
 </div>
 <div className={`text-3xl ${iconColor}`}>
 {icon}
 </div>
 </div>
 </div>
 );
}
