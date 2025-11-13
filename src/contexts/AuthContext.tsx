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
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setUser(user);
          
          // Optionally verify token with backend in background
          try {
            const isValid = await authAPI.verifyToken(token);
            if (!isValid) {
              // Token is invalid, clear storage
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              setUser(null);
            }
          } catch (error) {
            // If verification fails, keep user logged in but log the error
            console.warn('Token verification failed:', error);
          }
        }
      } catch (error) {
        console.error('Quick auth check failed:', error);
      } finally {
        setIsLoading(false);
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

  // OAuth login - redirect to backend OAuth endpoint
  const loginWithGoogle = async (): Promise<void> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/v1/api';
      const oauthUrl = `${backendUrl}/auth/oauth2/authorization/google`;
      
      // Redirect to backend OAuth endpoint
      window.location.href = oauthUrl;
    } catch (error) {
      console.error('Google OAuth redirect failed:', error);
      throw error;
    }
  };

  // Handle OAuth success (called from success page)
  const handleOAuthSuccess = (token: string, userInfo: { email: string; name: string; userId: string }) => {
    const user: User = {
      id: userInfo.userId,
      email: userInfo.email,
      name: userInfo.name,
    };

    // Store token and user data
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    setUser(user);
    setIsLoading(false);
  };

  const logout = async () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

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