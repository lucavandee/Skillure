import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useRequireRole = (allowedRoles: string[]) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && !allowedRoles.includes(user.role)) {
      navigate('/unauthorized');
      return;
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, navigate]);

  return { user, isLoading, isAuthenticated };
};

export default useRequireRole;