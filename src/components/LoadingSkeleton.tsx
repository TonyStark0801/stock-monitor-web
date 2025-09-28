'use client';

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-stock">
      <div className="text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📈 <span className="text-blue-400">StockPulse</span>
          </h1>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
        
        {/* Animated Loading Indicator */}
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-400/20 mx-auto"></div>
        </div>
        
        {/* Loading Text */}
        <div className="mt-6 space-y-2">
          <div className="h-2 bg-white/10 rounded animate-pulse w-48 mx-auto"></div>
          <div className="h-2 bg-white/10 rounded animate-pulse w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
