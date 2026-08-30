
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const permittedRoles = requiredRole ? (Array.isArray(requiredRole) ? requiredRole : [requiredRole]) : [];
  if (requiredRole && !permittedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Check if engineer has completed onboarding
  if (user.role === 'engineer' && !user.engineer?.is_onboarded) {
    // Allow access to onboarding page itself
    if (location.pathname === '/onboarding') {
      return <>{children}</>;
    }
    // Redirect to onboarding for all other engineer routes
    return <Navigate to="/onboarding" replace />;
  }

  // If engineer is onboarded but trying to access onboarding page, redirect to dashboard
  if (user.role === 'engineer' && user.engineer?.is_onboarded && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard/engineer" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
