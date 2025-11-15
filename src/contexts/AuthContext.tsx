'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { authAPI, ApiError } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fast initial check - non-blocking
    const quickCheck = async () => {
      console.log('[AUTH_DEBUG] AuthContext: Initial auth check started');
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        console.log('[AUTH_DEBUG] AuthContext: Token exists:', !!token, 'UserData exists:', !!userData);
        
        if (token && userData) {
          const user = JSON.parse(userData);
          console.log('[AUTH_DEBUG] AuthContext: Setting user from localStorage:', { email: user.email, id: user.id });
          setUser(user);
          console.log('[AUTH_DEBUG] AuthContext: User state set, isAuthenticated will be:', !!user);
        } else {
          console.log('[AUTH_DEBUG] AuthContext: No stored auth data found');
        }
      } catch (error) {
        console.error('[AUTH_DEBUG] AuthContext: Quick auth check failed:', error);
      } finally {
        setIsLoading(false);
        console.log('[AUTH_DEBUG] AuthContext: Initial auth check completed, isLoading set to false');
      }
    };

    // Use setTimeout to make it non-blocking
    setTimeout(quickCheck, 0);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // Call the real backend API
      const authData = await authAPI.login(credentials);
      
      // Store token and user data
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('userData', JSON.stringify(authData.user));
      setUser(authData.user);
      
    } catch (error) {
      console.error('Login failed:', error);
      
      // For development/testing: Fall back to mock if backend is not available
      if (error instanceof ApiError && error.status >= 500) {
        console.log('Backend unavailable, using mock data for development');
        const mockUser: User = {
          id: 'mock-' + Date.now(),
          email: credentials.email,
          name: credentials.email.split('@')[0],
        };
        
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        // Re-throw the error for the UI to handle
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // Call the real backend API
      const authData = await authAPI.register({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });
      
      // Store token and user data
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('userData', JSON.stringify(authData.user));
      setUser(authData.user);
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      // For development/testing: Fall back to mock if backend is not available
      if (error instanceof ApiError && error.status >= 500) {
        console.log('Backend unavailable, using mock data for development');
        const mockUser: User = {
          id: 'mock-' + Date.now(),
          email: credentials.email,
          name: credentials.name,
        };
        
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('userData', JSON.stringify(mockUser));
        setUser(mockUser);
      } else {
        // Re-throw the error for the UI to handle
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OAuth login - redirect to backend OAuth endpoint with PKCE
  const loginWithGoogle = async (): Promise<void> => {
    console.log('[AUTH_DEBUG] AuthContext: loginWithGoogle called');
    try {
      // Import PKCE utilities
      const { generateCodeVerifier, generateCodeChallenge, storeCodeVerifier } = await import('@/lib/pkce');
      
      // Step 1: Generate PKCE code verifier (random string)
      const codeVerifier = generateCodeVerifier();
      console.log('[AUTH_DEBUG] AuthContext: PKCE code_verifier generated');
      
      // Step 2: Compute code challenge (SHA256 hash of verifier)
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      console.log('[AUTH_DEBUG] AuthContext: PKCE code_challenge computed');
      
      // Step 3: Store code_verifier in sessionStorage (will be used during code exchange)
      storeCodeVerifier(codeVerifier);
      console.log('[AUTH_DEBUG] AuthContext: PKCE code_verifier stored in sessionStorage');
      
      // Step 4: Build OAuth URL with PKCE parameters
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/v1/api';
      const oauthUrl = `${backendUrl}/auth/oauth2/authorization/google?code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;
      
      console.log('[AUTH_DEBUG] AuthContext: Redirecting to OAuth URL:', oauthUrl);
      // Step 5: Redirect to backend OAuth endpoint
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('[AUTH_DEBUG] AuthContext: Google OAuth redirect failed:', error);
      // Clear PKCE data on error
      try {
        const { clearPKCEData } = await import('@/lib/pkce');
        clearPKCEData();
      } catch (clearError) {
        console.error('[AUTH_DEBUG] AuthContext: Failed to clear PKCE data:', clearError);
      }
      throw error;
    }
  };

  // Handle OAuth success (called from success page)
  const handleOAuthSuccess = (token: string, userInfo: { email: string; name: string; userId: string; avatar?: string }) => {
    console.log('[AUTH_DEBUG] AuthContext: handleOAuthSuccess called', { email: userInfo.email, userId: userInfo.userId });
    
    const user: User = {
      id: userInfo.userId,
      email: userInfo.email,
      name: userInfo.name,
      avatar: userInfo.avatar || undefined,
    };

    // Store token and user data
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    console.log('[AUTH_DEBUG] AuthContext: Token and userData stored in localStorage');
    
    setUser(user);
    console.log('[AUTH_DEBUG] AuthContext: User state updated, isAuthenticated:', true);
    
    setIsLoading(false);
    console.log('[AUTH_DEBUG] AuthContext: isLoading set to false');
  };

  const logout = async () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  // Debug log when auth state changes
  useEffect(() => {
    console.log('[AUTH_DEBUG] AuthContext: State changed', {
      hasUser: !!user,
      userEmail: user?.email,
      isLoading,
      isAuthenticated: !!user,
      timestamp: new Date().toISOString()
    });
  }, [user, isLoading]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    handleOAuthSuccess, // Add this to the context type
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}