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
    const quickCheck = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Quick auth check failed:', error);
      }
      setIsLoading(false);
    };

    // Use setTimeout to make it non-blocking
    setTimeout(quickCheck, 0);
  }, []);

  const _checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // TODO: Verify token with your backend
        // For now, we'll simulate a user from stored data
        const userData = localStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const loginWithGoogle = async (): Promise<void> => {
    try {
      // TODO: Implement Google OAuth flow
      // For now, simulate Google login
      const mockUser: User = {
        id: 'google-1',
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://via.placeholder.com/40',
      };
      
      localStorage.setItem('authToken', 'google-mock-token');
      localStorage.setItem('userData', JSON.stringify(mockUser));
      setUser(mockUser);
      
      console.log('Google login simulation - implement OAuth flow');
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginWithGoogle,
      }}
    >
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