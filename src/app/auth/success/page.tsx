'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

function OAuthSuccessContent() {
  const { handleOAuthSuccess, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasRedirected, setHasRedirected] = useState(false);
  const processingRef = useRef(false); // Track if processing has started/completed

  useEffect(() => {
    console.log('[AUTH_DEBUG] SuccessPage: useEffect triggered', { hasRedirected, status, isAuthenticated, isProcessing: processingRef.current });
    
    // Prevent multiple executions
    if (hasRedirected || processingRef.current) {
      console.log('[AUTH_DEBUG] SuccessPage: Already redirected or processing, skipping');
      return;
    }

    // If user is already authenticated, skip processing (already completed)
    if (isAuthenticated && status === 'processing') {
      console.log('[AUTH_DEBUG] SuccessPage: User already authenticated, setting success status');
      setStatus('success');
      processingRef.current = true; // Mark as processed
      return;
    }

    processingRef.current = true; // Mark as processing started
    const processOAuthCallback = async () => {
      console.log('[AUTH_DEBUG] SuccessPage: processOAuthCallback started');
      try {
        // Extract code from URL (secure - no sensitive data in URL)
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        console.log('[AUTH_DEBUG] SuccessPage: URL params', { hasCode: !!code, hasError: !!error, error });

        // Check for error first
        if (error) {
          console.log('[AUTH_DEBUG] SuccessPage: Error in URL params, setting error status');
          setStatus('error');
          setErrorMessage(decodeURIComponent(error));
          setTimeout(() => {
            router.replace('/auth?error=oauth_failed');
          }, 3000);
          return;
        }

        // Validate code parameter
        if (!code) {
          console.log('[AUTH_DEBUG] SuccessPage: Missing OAuth code, setting error status');
          setStatus('error');
          setErrorMessage('Missing OAuth code');
          setTimeout(() => {
            router.replace('/auth?error=oauth_failed');
          }, 3000);
          return;
        }

        console.log('[AUTH_DEBUG] SuccessPage: OAuth code found, retrieving PKCE verifier');
        
        // Get PKCE code_verifier from sessionStorage
        const { getCodeVerifier, clearPKCEData } = await import('@/lib/pkce');
        const codeVerifier = getCodeVerifier();

        if (!codeVerifier) {
          // If user is already authenticated, this is a re-run - don't show error
          if (isAuthenticated) {
            console.log('[AUTH_DEBUG] SuccessPage: Missing code_verifier but user already authenticated (re-run), setting success');
            setStatus('success');
            return;
          }
          console.log('[AUTH_DEBUG] SuccessPage: Missing code_verifier, setting error status');
          setStatus('error');
          setErrorMessage('Missing code verifier. Please try logging in again.');
          clearPKCEData(); // Clean up
          processingRef.current = false; // Allow retry
          setTimeout(() => {
            router.replace('/auth?error=oauth_failed');
          }, 3000);
          return;
        }

        console.log('[AUTH_DEBUG] SuccessPage: Code verifier found, calling exchangeOAuthCode API');
        
        // Exchange code for token securely via API call with PKCE
        const { authAPI } = await import('@/lib/api');
        
        // Make the API call - if this fails, it will throw and be caught below
        const authData = await authAPI.exchangeOAuthCode(code, codeVerifier);
        
        console.log('[AUTH_DEBUG] SuccessPage: API call successful', { hasToken: !!authData.token, userEmail: authData.user?.email });

        // Only proceed if we have valid auth data
        if (!authData || !authData.token || !authData.user) {
          console.error('[AUTH_DEBUG] SuccessPage: Invalid auth data received', authData);
          throw new Error('Invalid response from authentication server');
        }

        console.log('[AUTH_DEBUG] SuccessPage: Auth data validated, clearing PKCE data');
        // Clear PKCE data after successful exchange
        clearPKCEData();

        console.log('[AUTH_DEBUG] SuccessPage: Calling handleOAuthSuccess');
        // Handle successful OAuth - set user state
        handleOAuthSuccess(authData.token, {
          email: authData.user.email,
          name: authData.user.name,
          userId: authData.user.id,
          avatar: authData.user.avatar,
        });

        console.log('[AUTH_DEBUG] SuccessPage: Setting status to success');
        setStatus('success');

        // Wait for state to update, then redirect using window.location for a hard redirect
        console.log('[AUTH_DEBUG] SuccessPage: Scheduling redirect to dashboard in 1 second');
        setTimeout(() => {
          if (!hasRedirected) {
            console.log('[AUTH_DEBUG] SuccessPage: Executing redirect to dashboard');
            setHasRedirected(true);
            // Use window.location for a hard redirect to prevent React Router issues
            window.location.href = '/dashboard';
          } else {
            console.log('[AUTH_DEBUG] SuccessPage: Redirect already executed, skipping');
          }
        }, 1000);

      } catch (err) {
        console.error('[AUTH_DEBUG] SuccessPage: OAuth callback processing failed:', err);
        console.error('[AUTH_DEBUG] SuccessPage: Error details', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          status: status,
          hasRedirected,
          isAuthenticated
        });
        
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to process authentication');
        console.log('[AUTH_DEBUG] SuccessPage: Error status set, error message:', err instanceof Error ? err.message : 'Failed to process authentication');
        
        // Clear PKCE data on error
        try {
          const { clearPKCEData } = await import('@/lib/pkce');
          clearPKCEData();
          console.log('[AUTH_DEBUG] SuccessPage: PKCE data cleared');
        } catch (clearError) {
          console.error('[AUTH_DEBUG] SuccessPage: Failed to clear PKCE data:', clearError);
        }
        
        // Ensure hasRedirected is false so we don't accidentally redirect
        setHasRedirected(false);
        processingRef.current = false; // Allow retry on error
        console.log('[AUTH_DEBUG] SuccessPage: hasRedirected reset to false, processingRef reset');
        
        // Redirect to auth page after showing error
        console.log('[AUTH_DEBUG] SuccessPage: Scheduling redirect to auth page in 3 seconds');
        setTimeout(() => {
          if (!hasRedirected) {
            console.log('[AUTH_DEBUG] SuccessPage: Executing redirect to auth page');
            setHasRedirected(true);
            router.replace('/auth?error=oauth_failed');
          } else {
            console.log('[AUTH_DEBUG] SuccessPage: Redirect already executed, skipping');
          }
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [searchParams, handleOAuthSuccess, router, hasRedirected, isAuthenticated, status]);

  // Also redirect if already authenticated (in case of page refresh or state already set)
  // BUT ONLY if status is success - never redirect on error
  useEffect(() => {
    console.log('[AUTH_DEBUG] SuccessPage: Redirect check useEffect', { status, isAuthenticated, hasRedirected });
    
    // CRITICAL: Never redirect if status is error or processing
    if (status === 'error' || status === 'processing') {
      console.log('[AUTH_DEBUG] SuccessPage: Skipping redirect - status is', status);
      return; // Don't redirect on error or while processing
    }
    
    // Only redirect if status is success and user is authenticated
    if (isAuthenticated && !hasRedirected && status === 'success') {
      console.log('[AUTH_DEBUG] SuccessPage: Conditions met for redirect - isAuthenticated:', isAuthenticated, 'status:', status);
      setHasRedirected(true);
      console.log('[AUTH_DEBUG] SuccessPage: Redirecting to dashboard from redirect check useEffect');
      window.location.href = '/dashboard';
    } else {
      console.log('[AUTH_DEBUG] SuccessPage: Redirect conditions not met', {
        isAuthenticated,
        hasRedirected,
        status,
        willRedirect: isAuthenticated && !hasRedirected && status === 'success'
      });
    }
  }, [isAuthenticated, hasRedirected, status]);

  // Debug log when error UI is rendered
  useEffect(() => {
    if (status === 'error') {
      console.log('[AUTH_DEBUG] SuccessPage: ERROR UI is being rendered', {
        errorMessage,
        isAuthenticated,
        hasRedirected,
        timestamp: new Date().toISOString()
      });
    }
  }, [status, errorMessage, isAuthenticated, hasRedirected]);

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
