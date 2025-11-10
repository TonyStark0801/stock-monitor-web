'use client';

import { useEffect, useState } from 'react';
import { stockAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const data = await stockAPI.getWatchlist(token);
          setWatchlist(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load watchlist:', err);
        setError('Failed to load watchlist');
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await stockAPI.removeFromWatchlist(token, symbol);
        setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
      }
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  return (
    <ProtectedRoute>
      <div className="py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">
            My Watchlist
          </h1>
          
          {loading ? (
            <div className="bg-white/10 backdrop-blur-md shadow-xl rounded-lg p-8 text-center border border-white/20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading your watchlist...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 backdrop-blur-md shadow-xl rounded-lg p-8 text-center border border-red-500/20">
              <p className="text-red-300">{error}</p>
            </div>
          ) : watchlist.length === 0 ? (
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
          ) : (
            <div className="grid gap-4">
              {watchlist.map((stock) => (
                <div key={stock.id} className="bg-white/10 backdrop-blur-md shadow-xl rounded-lg p-6 border border-white/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{stock.symbol}</h3>
                      <p className="text-gray-300">{stock.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">${stock.price.toFixed(2)}</p>
                      <p className={`text-sm ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromWatchlist(stock.symbol)}
                      className="ml-4 text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
