'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <div className="py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            Price Alerts
          </h1>
          
          <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-lg p-8 text-center border border-white/20">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5-5-5h5V3h0zm-5-10H5l5-5 5 5H5v14h0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No price alerts set
            </h3>
            <p className="text-gray-300 mb-6">
              Create alerts to get notified when stocks reach your target prices.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Create Your First Alert
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}