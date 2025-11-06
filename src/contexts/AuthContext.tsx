'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginCredentials, RegisterCredentials, RegisterResponse, GenerateOtpResponse } from '@/types/auth';
import { authAPI, ApiError } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            setUser(user);
          } catch (error) {
            // Failed to parse user data, clear everything
            console.error('Failed to parse stored user data:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);


  const login = async (credentials: LoginCredentials): Promise<{ needsVerification: boolean; email?: string }> => {
    setIsLoading(true);
    try {
      // Call the real backend API
      const authData = await authAPI.login(credentials);

      // Check if email verification is required (enabled: false)
      const enabled = authData.enabled ?? authData.user?.enabled ?? true;

      if (!enabled) {
        // User needs email verification, store credentials temporarily
        sessionStorage.setItem('pendingVerificationEmail', credentials.email);
        sessionStorage.setItem('pendingVerificationPassword', credentials.password);
        return { needsVerification: true, email: credentials.email };
      }

      // User is verified, store token and user data
      const user = authData.user || {
        id: authData.userId || '',
        email: authData.email || credentials.email,
        name: authData.name || '',
        enabled: true
      };

      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('userData', JSON.stringify(user));
      setUser(user);

      return { needsVerification: false };

    } catch (error) {
      console.error('Login failed:', error);
      // Re-throw the error for the UI to handle
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    setIsLoading(true);
    try {
      // Call the real backend API - returns token and user with enabled flag
      const registerData = await authAPI.register({
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });

      // Check if email verification is required (enabled: false)
      // Handle both flat structure (enabled directly) and nested structure (user.enabled)
      const enabled = registerData.enabled ?? registerData.user?.enabled ?? true;

      if (!enabled) {
        // User needs email verification, store credentials temporarily
        sessionStorage.setItem('pendingVerificationEmail', credentials.email);
        sessionStorage.setItem('pendingVerificationPassword', credentials.password);
      } else {
        // User is already verified, store token and user data
        const user = registerData.user || {
          id: registerData.userId || '',
          email: registerData.email || credentials.email,
          name: registerData.name || credentials.name,
          enabled: true
        };

        localStorage.setItem('authToken', registerData.token);
        localStorage.setItem('userData', JSON.stringify(user));
        setUser(user);
      }

      // Return the registration response
      return registerData;

    } catch (error) {
      console.error('Registration failed:', error);
      // Re-throw the error for the UI to handle
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateOtp = async (email: string, password: string): Promise<GenerateOtpResponse> => {
    setIsLoading(true);
    try {
      const response = await authAPI.generateOtp(email, password);
      return response;
    } catch (error) {
      console.error('OTP generation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validateOtp = async (email: string, transactionId: string, otp: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Validate OTP with backend - returns token and user data
      const response = await authAPI.validateOtp(email, transactionId, otp);

      if (response.enabled) {
        // OTP validated successfully, use the token from the response
        const user = {
          id: response.userId || '',
          email: response.email || email,
          name: response.name || '',
          enabled: true
        };

        // Store token and user data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(user));
        setUser(user);

        // Clear temporary credentials
        sessionStorage.removeItem('pendingVerificationEmail');
        sessionStorage.removeItem('pendingVerificationPassword');
      } else {
        throw new Error('Email verification failed');
      }

    } catch (error) {
      console.error('OTP validation failed:', error);
      // Re-throw the error for the UI to handle
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    throw new Error('Google OAuth login is not implemented yet. Please use email/password login.');
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
        generateOtp,
        validateOtp,
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