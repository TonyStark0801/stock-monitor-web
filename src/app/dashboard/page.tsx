'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Image from 'next/image';


export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-lg p-6 mb-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-300 mt-1">
                  {user?.email}
                </p>
              </div>
              {user?.avatar && (
                <Image
                  src={user.avatar}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-medium text-white mb-4">
                Portfolio Overview
              </h3>
              <p className="text-gray-300">
                Your portfolio analytics will appear here once you start adding stocks to your watchlist.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-medium text-white mb-4">
                Active Alerts
              </h3>
              <p className="text-gray-300">
                Set up price alerts to stay informed about your favorite stocks.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-medium text-white mb-4">
                Market Summary
              </h3>
              <p className="text-gray-300">
                Real-time market data and trends will be displayed here.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}