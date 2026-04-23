import type { Role } from '../auth/AuthContext';
import { toast } from 'sonner';

/**
 * Get the default dashboard route for a specific role
 */
export const getRoleDashboard = (role: Role): string => {
  const roleRoutes: Record<Role, string> = {
    'STUDENT': '/student/status',
    'MENTOR': '/mentor',
    'SECURITY': '/security',
    'HOD': '/hod'
  };
  
  return roleRoutes[role];
};

/**
 * Get all available routes for a specific role
 */
export const getRoleRoutes = (role: Role): string[] => {
  const routes: Record<Role, string[]> = {
    'STUDENT': ['/', '/apply', '/student/status'],
    'MENTOR': ['/', '/mentor'],
    'SECURITY': ['/', '/security'],
    'HOD': ['/', '/hod', '/admin']
  };
  
  return routes[role] || ['/'];
};

/**
 * Check if a user has access to a specific route
 */
export const hasRouteAccess = (role: Role | null | undefined, route: string): boolean => {
  if (!role) return route === '/' || route === '/contact-admin';
  
  const allowedRoutes = getRoleRoutes(role);
  return allowedRoutes.includes(route);
};

/**
 * Redirect to role dashboard with toast notification
 */
export const redirectToRoleDashboard = (
  role: Role, 
  navigate: (to: string, options?: any) => void,
  options?: { replace?: boolean; showToast?: boolean; delay?: number }
) => {
  const { replace = true, showToast = true, delay = 0 } = options || {};
  
  const targetRoute = getRoleDashboard(role);
  
  const performRedirect = () => {
    if (showToast) {
      toast.success(`Redirecting to your ${role.toLowerCase()} dashboard...`);
    }
    navigate(targetRoute, { replace });
  };
  
  if (delay > 0) {
    setTimeout(performRedirect, delay);
  } else {
    performRedirect();
  }
};

/**
 * Role-based navigation helper
 */
export const roleNavigation = {
  getRoleDashboard,
  getRoleRoutes,
  hasRouteAccess,
  redirectToRoleDashboard
};
