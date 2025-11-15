'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';

function AuthContent() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [oauthError, setOauthError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Check for OAuth error in URL params
    const error = searchParams.get('error');
    console.log('[AUTH_DEBUG] AuthPage: Checking URL params', { error });
    if (error === 'oauth_failed') {
      console.log('[AUTH_DEBUG] AuthPage: OAuth error detected, setting error message');
      setOauthError('Google sign-in failed. Please try again or use email/password.');
    }
  }, [searchParams]);

  // Redirect if already authenticated (but wait for loading to complete)
  useEffect(() => {
    console.log('[AUTH_DEBUG] AuthPage: Redirect check', { isLoading, isAuthenticated });
    if (!isLoading && isAuthenticated) {
      console.log('[AUTH_DEBUG] AuthPage: User authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    } else {
      console.log('[AUTH_DEBUG] AuthPage: Not redirecting', { isLoading, isAuthenticated });
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-stock">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Don't render form if authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* OAuth Error Message */}
        {oauthError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-300 text-sm text-center">{oauthError}</p>
          </div>
        )}

        <AuthForm 
          mode={mode}
          onToggleMode={toggleMode}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-stock">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}