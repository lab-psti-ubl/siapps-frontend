import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const getCurrentPath = useCallback(() => {
    return location.pathname;
  }, [location.pathname]);

  const isCurrentPath = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  const getActiveMenu = useCallback(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 2) {
      return pathSegments[1]; // Get the menu part after /admin or /user
    }
    return 'dashboard';
  }, [location.pathname]);

  const getUserType = useCallback(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 1) {
      return pathSegments[0] as 'admin' | 'user';
    }
    return null;
  }, [location.pathname]);

  return {
    navigateTo,
    getCurrentPath,
    isCurrentPath,
    getActiveMenu,
    getUserType,
    location,
    navigate
  };
};