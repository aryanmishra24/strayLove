import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.log('[ProtectedRoute] Loading timeout reached');
        setHasTimedOut(true);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timeout);
    } else {
      setHasTimedOut(false);
    }
  }, [isLoading]);

  console.log('[ProtectedRoute] State:', { 
    isAuthenticated, 
    isLoading, 
    hasTimedOut,
    hasRole: requiredRole ? hasRole(requiredRole) : 'N/A', 
    pathname: location.pathname,
    user: useAuthStore.getState().user,
    token: useAuthStore.getState().token
  });

  // Show loading spinner while checking authentication, but with timeout
  if (isLoading && !hasTimedOut) {
    console.log('[ProtectedRoute] Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we've timed out, force a re-initialization and show a message
  if (hasTimedOut) {
    console.log('[ProtectedRoute] Loading timed out, forcing re-initialization');
    useAuthStore.getState().setLoading(false);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Loading timeout
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && !hasRole(requiredRole)) {
    console.log('[ProtectedRoute] Role check failed, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('[ProtectedRoute] Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute; 