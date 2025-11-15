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

// Export the generic API call function for other features
export { apiCall, ApiError };
export type { ApiResponse, AuthResponse };