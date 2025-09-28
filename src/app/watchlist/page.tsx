'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function WatchlistPage() {
  return (
    <ProtectedRoute>
      <div className="py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            My Watchlist
          </h1>
          
          <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-lg p-8 text-center border border-white/20">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No stocks in your watchlist yet
            </h3>
            <p className="text-gray-300 mb-6">
              Start building your watchlist by adding stocks you want to monitor.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Add Your First Stock
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
