'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { currentUser, loading, authInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authInitialized && !loading && !currentUser) {
      // Add the current path as redirect parameter if it's not the login page
      const returnUrl = window.location.pathname;
      const redirectUrl = returnUrl !== '/login' 
        ? `${redirectTo}?redirect=${encodeURIComponent(returnUrl)}`
        : redirectTo;
        
      router.push(redirectUrl);
    }
  }, [authInitialized, loading, currentUser, router, redirectTo]);

  // Show loading state while checking auth
  if (loading || !authInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-yellow-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show children only if user is authenticated
  return currentUser ? <>{children}</> : null;
}