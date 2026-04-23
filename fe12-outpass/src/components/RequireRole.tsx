import React from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type Role } from '../auth/AuthContext';

export const RequireRole: React.FC<{ roles: Role[]; children: ReactNode }> = ({ roles, children }) => {
  const { user, loading } = useAuth();

  // In development mode, bypass ALL role requirements for any route
  // Check VITE_NODE_ENV first, then fall back to Vite's DEV flag
  const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development' || 
                       (import.meta.env.VITE_NODE_ENV !== 'production' && import.meta.env.DEV);

  console.log('🔍 RequireRole: Checking route access...', {
    loading,
    userExists: !!user,
    userRole: user?.role,
    requiredRoles: roles,
    isDevelopment,
    'VITE_NODE_ENV': import.meta.env.VITE_NODE_ENV,
    'import.meta.env.DEV': import.meta.env.DEV,
    currentPath: window.location.pathname,
  });

  // Development bypass for ALL routes - allow access without authentication or role checks
  if (isDevelopment) {
    console.log('🔧 DEVELOPMENT MODE: Bypassing ALL role requirements for route:', window.location.pathname);
    return <>{children}</>;
  }

  if (loading) {
    console.log('⏳ RequireRole: Loading user data...');
    return <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  if (!user) {
    console.log('❌ RequireRole: User not authenticated. Redirecting to home.');
    return <Navigate to="/" replace />;
  }

  if (!user.role) {
    console.log('❌ RequireRole: User has no role assigned. Redirecting to contact admin.');
    return <Navigate to="/contact-admin" replace />;
  }

  if (!roles.includes(user.role)) {
    console.log(`❌ RequireRole: Access denied. User role: ${user.role}, Required roles: ${roles.join(', ')}`);
    return <Navigate to="/" replace />;
  }

  console.log(`✅ RequireRole: Access granted. User role: ${user.role}`);
  return <>{children}</>;
};
