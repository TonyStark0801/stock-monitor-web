'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { marketAPI, MarketIndex, TrendingStock, StockPrice } from '@/lib/api';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<TrendingStock[]>([]);
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [loading, setLoading] = useState(true); // Only for initial load
  const [error, setError] = useState<string | null>(null);

  // Get user initial for fallback
  const getUserInitial = (name?: string) => {
    if (!name) return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  // Check if avatar is valid (base64 data URL or external URL)
  const hasValidAvatar = user?.avatar && 
    (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http://') || user.avatar.startsWith('https://'));

  useEffect(() => {
    // Initial fetch with loading indicator
    const fetchMarketDataInitial = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all market data in parallel
        const [indicesData, trendingData, stocksData] = await Promise.all([
          marketAPI.getMarketIndices(),
          marketAPI.getTrendingStocks(10),
          marketAPI.getStocksWithPrices(0, 20)
        ]);
        
        setIndices(indicesData);
        setTrendingStocks(trendingData);
        setStocks(stocksData);
      } catch (err) {
        console.error('Failed to fetch market data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    // Background polling function (no loading indicator)
    const fetchMarketDataBackground = async () => {
      try {
        // Silently fetch in background - don't set loading or error states
        const [indicesData, trendingData, stocksData] = await Promise.all([
          marketAPI.getMarketIndices(),
          marketAPI.getTrendingStocks(10),
          marketAPI.getStocksWithPrices(0, 20)
        ]);
        
        // Only update state if we got valid data
        if (indicesData && indicesData.length >= 0) {
          setIndices(indicesData);
        }
        if (trendingData && trendingData.length >= 0) {
          setTrendingStocks(trendingData);
        }
        if (stocksData && stocksData.length >= 0) {
          setStocks(stocksData);
        }
      } catch (err) {
        // Silently fail - don't show error or loading state
        // Only log for debugging
        console.debug('Background fetch failed (silent):', err);
        // Don't update state if fetch fails - keep existing data visible
      }
    };

    // Initial fetch
    fetchMarketDataInitial();
    
    // Background polling every 30 seconds (no loading indicator)
    const interval = setInterval(fetchMarketDataBackground, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number | null | undefined): string => {
    if (price == null) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number | null | undefined): string => {
    if (change == null) return 'N/A';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  const formatChangePercent = (percent: number | null | undefined): string => {
    if (percent == null) return 'N/A';
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const formatVolume = (volume: number | null | undefined): string => {
    if (volume == null) return 'N/A';
    if (volume >= 10000000) return `${(volume / 10000000).toFixed(2)}Cr`;
    if (volume >= 100000) return `${(volume / 100000).toFixed(2)}L`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toString();
  };

  return (
    <ProtectedRoute>
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* User Welcome Card */}
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
              {hasValidAvatar && !imageError ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-white/30 object-cover"
                  onError={() => {
                    console.log('[AUTH_DEBUG] Dashboard: Image load error, falling back to initials');
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold border-2 border-white/30">
                  {getUserInitial(user?.name)}
                </div>
              )}
            </div>
          </div>

          {/* Market Indices Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Market Indices</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {indices.map((index) => (
                  <div
                    key={index.symbol}
                    className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white">{index.name}</h3>
                      {index.changePercent >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-lg font-bold text-white mb-1">
                      {formatPrice(index.currentPrice)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          index.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {formatChange(index.change)} ({formatChangePercent(index.changePercent)})
                      </span>
            </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {index.exchange}
                    </p>
                  </div>
                ))}
              </div>
            )}
            </div>

          {/* Trending Stocks Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Trending Stocks</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300">{error}</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-gray-300">Symbol</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-300">Name</th>
                        <th className="text-right p-4 text-sm font-semibold text-gray-300">Price</th>
                        <th className="text-right p-4 text-sm font-semibold text-gray-300">Change</th>
                        <th className="text-right p-4 text-sm font-semibold text-gray-300">Volume</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-300">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendingStocks.map((stock) => (
                        <tr
                          key={stock.symbol}
                            className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <span className="font-semibold text-white">{stock.symbol}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-300">{stock.name}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-white font-medium">{formatPrice(stock.currentPrice)}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span
                              className={`font-medium flex items-center justify-end gap-1 ${
                                stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {stock.changePercent >= 0 ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                              {formatChangePercent(stock.changePercent)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-gray-300">{formatVolume(stock.volume)}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                              {stock.trendReason.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
            )}
          </div>

          {/* Stock List Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Stock List</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300">{error}</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-gray-300">Symbol</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-300">Name</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-300">Exchange</th>
                        <th className="text-left p-4 text-sm font-semibold text-gray-300">Sector</th>
                        <th className="text-right p-4 text-sm font-semibold text-gray-300">Price</th>
                        <th className="text-right p-4 text-sm font-semibold text-gray-300">Change</th>
                        <th className="text-right p-4 text-sm font-semibold text-gray-300">High</th>
                        <th className="text-right p-4 text-sm font-semibold text-gray-300">Low</th>
                        <th className="text-right p-4 text-sm font-semibold text-gray-300">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map((stock) => (
                        <tr
                          key={stock.id}
                          className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <span className="font-semibold text-white">{stock.symbol}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-300">{stock.name}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-400 text-sm">{stock.exchange}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-400 text-sm">{stock.sector || 'N/A'}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-white font-medium">{formatPrice(stock.currentPrice)}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span
                              className={`font-medium flex items-center justify-end gap-1 ${
                                stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {stock.changePercent >= 0 ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4" />
                              )}
                              {formatChangePercent(stock.changePercent)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-gray-300 text-sm">{formatPrice(stock.dayHigh)}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-gray-300 text-sm">{formatPrice(stock.dayLow)}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-gray-300 text-sm">{formatVolume(stock.volume)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}