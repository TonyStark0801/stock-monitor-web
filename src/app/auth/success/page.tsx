'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function OAuthSuccessContent() {
  const { handleOAuthSuccess } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Extract parameters from URL
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const userId = searchParams.get('userId');
        const error = searchParams.get('error');

        // Check for error first
        if (error) {
          setStatus('error');
          setErrorMessage(decodeURIComponent(error));
          setTimeout(() => {
            router.push('/login?error=oauth_failed');
          }, 3000);
          return;
        }

        // Validate required parameters
        if (!token || !email || !name || !userId) {
          setStatus('error');
          setErrorMessage('Missing required authentication parameters');
          setTimeout(() => {
            router.push('/login?error=oauth_failed');
          }, 3000);
          return;
        }

        // Handle successful OAuth
        handleOAuthSuccess(token, {
          email: decodeURIComponent(email),
          name: decodeURIComponent(name),
          userId: decodeURIComponent(userId),
        });

        setStatus('success');

        // Redirect to dashboard after a brief success message
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (err) {
        console.error('OAuth callback processing failed:', err);
        setStatus('error');
        setErrorMessage('Failed to process authentication');
        setTimeout(() => {
          router.push('/login?error=oauth_failed');
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [searchParams, handleOAuthSuccess, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-stock">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20 shadow-xl">
        {status === 'processing' && (
          <>
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Completing Sign In...
            </h2>
            <p className="text-gray-300">
              Please wait while we set up your account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Welcome to StockPulse!
            </h2>
            <p className="text-gray-300 mb-4">
              Your account has been set up successfully.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Authentication Failed
            </h2>
            <p className="text-gray-300 mb-4">
              {errorMessage || 'Something went wrong during sign in.'}
            </p>
            <p className="text-sm text-gray-400">
              Redirecting back to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-stock">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <OAuthSuccessContent />
    </Suspense>
  );
}
