import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'sonner';
import { getRoleDashboard } from '../utils/roleNavigation';

interface RoleRedirectOptions {
  /** Whether to redirect users with roles away from contact-admin page */
  redirectFromContactAdmin?: boolean;
  /** Whether to redirect users to their role-specific dashboard from home page */
  redirectFromHome?: boolean;
  /** Custom delay in milliseconds before redirect */
  delay?: number;
}

export const useRoleRedirect = (options: RoleRedirectOptions = {}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    redirectFromContactAdmin = true,
    redirectFromHome = false,
    delay = 1000
  } = options;

  useEffect(() => {
    if (loading || !user) return;

    // Redirect users without roles to contact-admin from any protected route
    if (!user.role && location.pathname !== '/contact-admin' && location.pathname !== '/') {
      toast.info('Please request a role to access this feature');
      navigate('/contact-admin', { replace: true });
      return;
    }

    // Redirect users with roles away from contact-admin page
    if (user.role && redirectFromContactAdmin && location.pathname === '/contact-admin') {
      const targetRoute = getRoleDashboard(user.role);
      setTimeout(() => {
        toast.success(`Welcome! Redirecting to your ${user.role!.toLowerCase()} dashboard...`);
        navigate(targetRoute, { replace: true });
      }, delay);
      return;
    }

    // Optional: Redirect users from home page to their role-specific dashboard
    if (user.role && redirectFromHome && location.pathname === '/') {
      const targetRoute = getRoleDashboard(user.role);
      if (targetRoute) {
        setTimeout(() => {
          toast.info(`Redirecting to your ${user.role!.toLowerCase()} dashboard...`);
          navigate(targetRoute, { replace: true });
        }, delay);
      }
    }
  }, [user, loading, location.pathname, navigate, redirectFromContactAdmin, redirectFromHome, delay]);
};
