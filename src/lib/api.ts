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

interface RegisterResponse {
  token: string;
  tokenType?: string;
  userId?: string | null;
  email?: string;
  name?: string;
  message?: string;
  enabled?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    enabled?: boolean;
  };
}

interface GenerateOtpRequest {
  email: string;
  password: string;
}

interface GenerateOtpResponse {
  transactionId: string;
  message: string;
}

interface ValidateOtpRequest {
  email: string;
  transactionId: string;
  otp: string;
}

interface ValidateOtpResponse {
  token: string;
  tokenType?: string;
  userId?: string;
  email?: string;
  name?: string;
  message?: string;
  enabled: boolean;
}

interface AuthResponse {
  token: string;
  tokenType?: string;
  userId?: string;
  email?: string;
  name?: string;
  message?: string;
  enabled?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    enabled?: boolean;
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
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
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
  // Register new user - returns token and user info with enabled flag
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiCall<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (!response.success || !response.data) {
      throw new ApiError(400, response.error || 'Registration failed');
    }

    return response.data;
  },

  // Generate OTP for email verification
  generateOtp: async (email: string, password: string, token: string): Promise<GenerateOtpResponse> => {
    const response = await apiCall<GenerateOtpResponse>('/auth/generateOtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CLIENT-EMAIL': email,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(400, response.error || 'Failed to generate OTP');
    }

    return response.data;
  },

  // Validate OTP
  validateOtp: async (email: string, transactionId: string, otp: string, token: string): Promise<ValidateOtpResponse> => {
    const response = await apiCall<ValidateOtpResponse>('/auth/validateOtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CLIENT-EMAIL': email,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ transactionId, otp }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(400, response.error || 'OTP validation failed');
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

  // Verify token (optional - for checking if user is still authenticated)
  verifyToken: async (token: string) => {
    const response = await apiCall('/auth/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.success;
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

// Stock and Watchlist API functions
export const stockAPI = {
  // Get user's watchlist
  getWatchlist: async (token: string) => {
    const response = await apiCall('/watchlist', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  },

  // Add stock to watchlist
  addToWatchlist: async (token: string, symbol: string) => {
    const response = await apiCall('/watchlist', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ symbol }),
    });
    
    return response.data;
  },

  // Remove stock from watchlist
  removeFromWatchlist: async (token: string, symbol: string) => {
    const response = await apiCall(`/watchlist/${symbol}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.success;
  },

  // Get stock data
  getStock: async (symbol: string) => {
    const response = await apiCall(`/stocks/${symbol}`, {
      method: 'GET',
    });
    
    return response.data;
  },

  // Search stocks
  searchStocks: async (query: string) => {
    const response = await apiCall(`/stocks/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
    
    return response.data;
  },
};

// Alerts API functions
export const alertsAPI = {
  // Get user's alerts
  getAlerts: async (token: string) => {
    const response = await apiCall('/alerts', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  },

  // Create new alert
  createAlert: async (token: string, alertData: {
    symbol: string;
    condition: 'above' | 'below';
    targetPrice: number;
  }) => {
    const response = await apiCall('/alerts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(alertData),
    });
    
    return response.data;
  },

  // Delete alert
  deleteAlert: async (token: string, alertId: string) => {
    const response = await apiCall(`/alerts/${alertId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.success;
  },
};

// Export the generic API call function for other features
export { apiCall, ApiError };
export type { ApiResponse, AuthResponse };