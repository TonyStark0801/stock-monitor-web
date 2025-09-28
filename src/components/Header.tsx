'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="p-4 shadow-lg bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:opacity-80">
          📈 StockPulse
        </Link>
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-6">
            <nav className="space-x-4 text-sm">
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/watchlist" className="hover:underline">Watchlist</Link>
              <Link href="/alerts" className="hover:underline">Alerts</Link>
            </nav>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-white">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth" 
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}