// API utility functions for backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/v1/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage for authenticated requests
  // Skip token for auth endpoints (login, register, oauth exchange)
  const isAuthEndpoint = endpoint.startsWith('/auth/register') || 
                         endpoint.startsWith('/auth/login') || 
                         endpoint.startsWith('/auth/oauth/exchange') ||
                         endpoint.startsWith('/auth/generateOtp') ||
                         endpoint.startsWith('/auth/validateOtp') ||
                         endpoint.startsWith('/auth/oauth2/');
  
  const token = !isAuthEndpoint ? localStorage.getItem('authToken') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && !isAuthEndpoint) {
        // Clear invalid token and user data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        // Optionally redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
      }
      throw new ApiError(response.status, data.error || data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    console.error('API call failed:', error);
    throw new ApiError(500, 'Network error or server unavailable');
  }
}

// Authentication API functions
export const authAPI = {
  // Register new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (!response.success || !response.data) {
      throw new ApiError(400, response.error || 'Registration failed');
    }
    
    return response.data;
  },

  // Login existing user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiCall<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (!response.success || !response.data) {
      throw new ApiError(401, response.error || 'Invalid credentials');
    }
    
    return response.data;
  },

  // Exchange OAuth code for token with PKCE validation (secure - code is single-use)
  exchangeOAuthCode: async (code: string, codeVerifier: string): Promise<AuthResponse> => {
    console.log('[AUTH_DEBUG] API: exchangeOAuthCode called', { hasCode: !!code, hasCodeVerifier: !!codeVerifier });
    try {
      const requestBody = { code, codeVerifier };
      console.log('[AUTH_DEBUG] API: Making POST request to /auth/oauth/exchange');
      
      const response = await apiCall<AuthResponse>('/auth/oauth/exchange', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      console.log('[AUTH_DEBUG] API: Response received', { success: response.success, hasData: !!response.data, error: response.error });
      
      if (!response.success || !response.data) {
        // Extract error message from response
        const errorMsg = response.error || response.message || 'Failed to exchange OAuth code';
        console.error('[AUTH_DEBUG] API: Exchange failed', { errorMsg, response });
        throw new ApiError(400, errorMsg);
      }
      
      // Transform response to match AuthResponse format
      const oauthData = response.data as any;
      console.log('[AUTH_DEBUG] API: OAuth data extracted', { hasToken: !!oauthData.token, hasUserId: !!oauthData.userId, hasEmail: !!oauthData.email });
      
      // Validate required fields
      if (!oauthData.token || !oauthData.userId || !oauthData.email) {
        console.error('[AUTH_DEBUG] API: Missing required fields', { 
          hasToken: !!oauthData.token, 
          hasUserId: !!oauthData.userId, 
          hasEmail: !!oauthData.email 
        });
        throw new ApiError(400, 'Invalid response from server: missing required fields');
      }
      
      const authResponse = {
        token: oauthData.token,
        user: {
          id: oauthData.userId,
          email: oauthData.email,
          name: oauthData.name || '',
          avatar: oauthData.avatar,
        },
      };
      
      console.log('[AUTH_DEBUG] API: Exchange successful', { userEmail: authResponse.user.email, userId: authResponse.user.id });
      return authResponse;
    } catch (error) {
      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        console.error('[AUTH_DEBUG] API: ApiError thrown', { status: error.status, message: error.message });
        throw error;
      }
      // Wrap other errors
      console.error('[AUTH_DEBUG] API: Unexpected error during exchange', error);
      throw new ApiError(500, error instanceof Error ? error.message : 'Failed to exchange OAuth code');
    }
  },

  // Logout (if you have server-side logout)
  logout: async (token: string) => {
    const response = await apiCall('/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.success;
  },
};

// Market data API functions
export const marketAPI = {
  // Get market indices (Nifty, Sensex, etc.)
  getMarketIndices: async (): Promise<MarketIndex[]> => {
    const response = await apiCall<MarketIndex[]>('/stocks/indices', {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new ApiError(400, response.error || 'Failed to fetch market indices');
    }
    
    // Return empty array if data is null/undefined, otherwise return the data
    return response.data || [];
  },

  // Get trending stocks
  getTrendingStocks: async (limit: number = 10): Promise<TrendingStock[]> => {
    const response = await apiCall<TrendingStock[]>(`/stocks/trending?limit=${limit}`, {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new ApiError(400, response.error || 'Failed to fetch trending stocks');
    }
    
    // Return empty array if data is null/undefined, otherwise return the data
    return response.data || [];
  },

  // Get stocks with prices
  getStocksWithPrices: async (page: number = 0, size: number = 20): Promise<StockPrice[]> => {
    const response = await apiCall<StockPrice[]>(`/stocks/prices?page=${page}&size=${size}`, {
      method: 'GET',
    });
    
    if (!response.success) {
      throw new ApiError(400, response.error || 'Failed to fetch stocks');
    }
    
    // Return empty array if data is null/undefined, otherwise return the data
    return response.data || [];
  },

  // Get market summary
  getMarketSummary: async (): Promise<MarketSummary> => {
    const response = await apiCall<MarketSummary>('/stocks/market-summary', {
      method: 'GET',
    });
    
    if (!response.success || !response.data) {
      throw new ApiError(400, response.error || 'Failed to fetch market summary');
    }
    
    return response.data;
  },
};

// Market data type definitions
export interface MarketIndex {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  previousClose: number;
  volume: number;
  exchange: string;
}

export interface StockPrice {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  currency: string;
  lastUpdated: string;
  isActive: boolean;
}

export interface TrendingStock {
  symbol: string;
  name: string;
  exchange: string;
  currentPrice: number;
  changePercent: number;
  volume: number;
  trendReason: string;
}

export interface MarketSummary {
  indices: MarketIndex[];
  trendingStocks: TrendingStock[];
  totalActiveStocks: number;
  marketStatus: string;
}

// Finnhub API functions (optional - for direct API calls if needed)
// Note: In production, these should go through your backend to keep API keys secure
export const finnhubAPI = {
  // Get real-time quote for a symbol
  // Note: This requires FINNHUB_API_KEY in environment variables
  getQuote: async (symbol: string): Promise<FinnhubQuoteResponse> => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
      throw new ApiError(400, 'Finnhub API key not configured');
    }

    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to fetch quote from Finnhub');
    }
    
    return response.json();
  },

  // Get company profile
  getCompanyProfile: async (symbol: string): Promise<FinnhubCompanyProfileResponse> => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
      throw new ApiError(400, 'Finnhub API key not configured');
    }

    const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to fetch company profile from Finnhub');
    }
    
    return response.json();
  },

  // Get stock candles (OHLCV data)
  getStockCandles: async (
    symbol: string,
    resolution: string,
    from: number,
    to: number
  ): Promise<FinnhubCandleResponse> => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
      throw new ApiError(400, 'Finnhub API key not configured');
    }

    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to fetch stock candles from Finnhub');
    }
    
    return response.json();
  },
};

// Finnhub API response types
export interface FinnhubQuoteResponse {
  c: number;  // Current price
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Unix timestamp
}

export interface FinnhubCompanyProfileResponse {
  name: string;
  ticker: string;
  exchange: string;
  finnhubIndustry: string;
  marketCapitalization: number;
  currency: string;
}

export interface FinnhubCandleResponse {
  s: string;        // Status: "ok" or "no_data"
  c: number[];      // Close prices
  h: number[];      // High prices
  l: number[];      // Low prices
  o: number[];      // Open prices
  t: number[];      // Unix timestamps
  v: number[];      // Volumes
}

// NSE India API functions (using stock-nse-india library via Next.js API routes)
export const nseAPI = {
  // Get NSE equity details for a symbol
  getEquityDetails: async (symbol: string): Promise<StockPrice> => {
    const response = await fetch(`/api/nse/equity?symbol=${encodeURIComponent(symbol)}`);
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new ApiError(response.status, data.error || 'Failed to fetch NSE equity details');
    }
    
    return data.data;
  },

  // Search NSE stocks
  searchStocks: async (query: string): Promise<Array<{ symbol: string; name: string }>> => {
    const response = await fetch(`/api/nse/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new ApiError(response.status, data.error || 'Failed to search NSE stocks');
    }
    
    return data.data;
  },

  // Get NSE market status
  getMarketStatus: async (): Promise<{ marketState: string; marketStatus: string }> => {
    const response = await fetch('/api/nse/market-status');
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new ApiError(response.status, data.error || 'Failed to fetch NSE market status');
    }
    
    return data.data;
  },

  // Get batch equity details
  getBatchEquityDetails: async (symbols: string[]): Promise<StockPrice[]> => {
    const response = await fetch('/api/nse/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbols }),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new ApiError(response.status, data.error || 'Failed to fetch batch NSE equity details');
    }
    
    return data.data;
  },
};

// Export the generic API call function for other features
export { apiCall, ApiError };
export type { ApiResponse, AuthResponse };