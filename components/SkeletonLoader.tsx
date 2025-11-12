'use client';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
 return (
 <div className="animate-pulse space-y-4">
 {Array.from({ length: rows }).map((_, i) => (
 <div key={i} className="flex items-center space-x-4 bg-gray-100 rounded-lg p-4">
 <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
 <div className="flex-1 space-y-2">
 <div className="h-4 bg-gray-300 rounded w-3/4"></div>
 <div className="h-3 bg-gray-300 rounded w-1/2"></div>
 </div>
 <div className="h-8 w-24 bg-gray-300 rounded"></div>
 </div>
 ))}
 </div>
 );
}

export function CardSkeleton() {
 return (
 <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="flex items-center justify-between mb-4">
 <div className="space-y-2 flex-1">
 <div className="h-4 bg-gray-300 rounded w-1/3"></div>
 <div className="h-8 bg-gray-300 rounded w-1/2"></div>
 </div>
 <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
 </div>
 </div>
 );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
 return (
 <div className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 p-6">
 <div className="mb-4">
 <div className="h-5 bg-gray-300 rounded w-1/4 mb-2"></div>
 <div className="h-3 bg-gray-300 rounded w-1/3"></div>
 </div>
 <div className="flex items-end space-x-2" style={{ height: `${height}px` }}>
 {Array.from({ length: 7 }).map((_, i) => (
 <div
 key={i}
 className="flex-1 bg-gray-300 rounded-t"
 style={{ height: `${Math.random() * 80 + 20}%` }}
 ></div>
 ))}
 </div>
 </div>
 );
}

