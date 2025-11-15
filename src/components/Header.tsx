'use client';

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Get user initial for fallback
  const getUserInitial = (name?: string) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  // Check if avatar is valid (base64 data URL or external URL)
  const hasValidAvatar = user?.avatar && 
    (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http://') || user.avatar.startsWith('https://'));

  return (
    <header className="p-4 shadow-lg bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white hover:opacity-80 transition-opacity">
          📈 StockPulse
        </Link>
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-4 md:space-x-6">
            <nav className="hidden md:flex space-x-4 text-sm">
              <Link href="/dashboard" className="text-white hover:text-blue-400 transition-colors">Dashboard</Link>
              <Link href="/watchlist" className="text-white hover:text-blue-400 transition-colors">Watchlist</Link>
              <Link href="/alerts" className="text-white hover:text-blue-400 transition-colors">Alerts</Link>
            </nav>
            
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Profile Avatar/Initial */}
              <div className="flex items-center space-x-2">
                {hasValidAvatar && !imageError ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-white/30 object-cover"
                    onError={() => {
                      console.log('[AUTH_DEBUG] Header: Image load error, falling back to initials');
                      setImageError(true);
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold border-2 border-white/30">
                    {getUserInitial(user?.name)}
                  </div>
                )}
                {/* Show full name on desktop, hidden on mobile */}
                <span className="hidden md:inline text-sm text-white font-medium">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
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