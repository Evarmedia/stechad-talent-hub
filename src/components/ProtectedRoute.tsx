
import React from 'react';
import { can, canAny, adminRedirectForPath, isCustomEmployee } from '@/lib/permissions';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string;
  anyPermissions?: string[];
  allowCustomEmployee?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, requiredPermission, anyPermissions, allowCustomEmployee }) => {
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

  const adminRedirect = adminRedirectForPath(user, location.pathname, location.search);
  if (adminRedirect) return <Navigate to={adminRedirect} replace />;

  const permittedRoles = requiredRole ? (Array.isArray(requiredRole) ? requiredRole : [requiredRole]) : [];
  if (requiredRole && !permittedRoles.includes(user.role) && !(allowCustomEmployee && isCustomEmployee(user))) {
    return <Navigate to="/login" replace />;
  }

  if ((requiredPermission && !can(user, requiredPermission)) || (anyPermissions && !canAny(user, anyPermissions))) {
    return <div role="alert" className="p-8"><h1 className="text-xl font-semibold">Access denied</h1><p className="mt-2 text-muted-foreground">Your account does not have permission to use this feature.</p></div>;
  }
  if (location.pathname === '/settings') return <>{children}</>;

  // Check if talent has completed onboarding
  if (user.role === 'talent' && !user.talent?.is_onboarded) {
    // Allow access to onboarding page itself
    if (location.pathname === '/onboarding') {
      return <>{children}</>;
    }
    // Redirect to onboarding for all other talent routes
    return <Navigate to="/onboarding" replace />;
  }

  // If talent is onboarded but trying to access onboarding page, redirect to dashboard
  if (user.role === 'talent' && user.talent?.is_onboarded && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard/talent" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
