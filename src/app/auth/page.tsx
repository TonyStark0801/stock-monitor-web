'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard');
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
        {/* OAuth Login Option */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to Google Sign In
          </Link>
        </div>

        <AuthForm 
          mode={mode}
          onToggleMode={toggleMode}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}