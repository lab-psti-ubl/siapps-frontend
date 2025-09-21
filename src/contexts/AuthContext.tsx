import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/auth';
import { authAPI } from '../services/api';

interface AuthContextType extends AuthState {
  login: (userType: 'admin' | 'user', credentials?: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userType: null,
    currentUser: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load authentication state from sessionStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedAuthState = sessionStorage.getItem('auth-state');
        if (savedAuthState) {
          const parsedAuthState = JSON.parse(savedAuthState);
          if (parsedAuthState.isAuthenticated) {
            setAuthState({
              isAuthenticated: true,
              userType: parsedAuthState.userType,
              currentUser: parsedAuthState.currentUser ? {
                ...parsedAuthState.currentUser,
                createdAt: new Date(parsedAuthState.currentUser.createdAt)
              } : null,
            });
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        sessionStorage.removeItem('auth-state');
      }
      setIsLoading(false);
    };

    loadAuthState();
  }, []);

  const login = async (userType: 'admin' | 'user', credentials?: any) => {
    try {
      let response;
      
      if (userType === 'admin') {
        response = await authAPI.adminLogin(credentials);
      } else {
        response = await authAPI.userLogin(credentials);
      }

      if (response.success) {
        const newAuthState = {
          isAuthenticated: true,
          userType: response.userType,
          currentUser: response.user || null,
        };
        
        setAuthState(newAuthState);
        
        // Persist auth state to sessionStorage (temporary session only)
        sessionStorage.setItem('auth-state', JSON.stringify(newAuthState));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    const newAuthState = {
      isAuthenticated: false,
      userType: null,
      currentUser: null,
    };
    
    setAuthState(newAuthState);
    sessionStorage.removeItem('auth-state');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};