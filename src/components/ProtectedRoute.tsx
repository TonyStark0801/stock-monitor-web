'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}