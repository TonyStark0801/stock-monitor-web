'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Image from 'next/image';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="p-4 mobile-header shadow-lg bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 backdrop-blur-md border-b border-blue-500/30 md:sticky mobile-sticky-header md:top-0 z-50 capacitor-header mobile-header-padding">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 group hover:scale-105 transition-transform duration-200">
          <div className="relative">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">📈</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              StockPulse
            </span>
            <span className="text-xs text-blue-300/70 -mt-1">Real-time monitoring</span>
          </div>
        </Link>
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            {/* Mobile: Show only user menu */}
            <div className="md:hidden flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <span className="text-sm text-white font-medium">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </div>
            </div>

            {/* Desktop: Show full navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-1">
                <Link href="/dashboard" className="px-3 py-1 text-sm text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  Dashboard
                </Link>
                <Link href="/watchlist" className="px-3 py-1 text-sm text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  Watchlist
                </Link>
                <Link href="/alerts" className="px-3 py-1 text-sm text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  Alerts
                </Link>
              </nav>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt="Profile"
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-white font-medium">
                    {user?.name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link 
              href="/auth" 
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span className="relative z-10">Sign In</span>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}