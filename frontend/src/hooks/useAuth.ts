import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useAuth = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    login: storeLogin, 
    register: storeRegister, 
    logout: storeLogout,
    initialize,
    setLoading,
    clearAuth 
  } = useAuthStore();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    try {
      console.log('[useAuth] Starting login...');
      await storeLogin({ email, password });
      console.log('[useAuth] Login successful, navigating to dashboard...');
      navigate('/dashboard');
      console.log('[useAuth] Navigation called');
    } catch (error) {
      console.error('[useAuth] Login error:', error);
      // Error is already handled by the store
      throw error;
    }
  };

  const register = async (username: string, name: string, email: string, password: string, confirmPassword: string) => {
    try {
      await storeRegister({ username, name, email, password, confirmPassword });
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled by the store
      throw error;
    }
  };

  const logout = async () => {
    try {
      await storeLogout();
      navigate('/');
    } catch (error) {
      // Error is already handled by the store
      throw error;
    }
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  const isAdmin = (): boolean => hasRole('ADMIN');
  const isVolunteer = (): boolean => hasRole(['ADMIN', 'VOLUNTEER']);
  const isUser = (): boolean => hasRole(['ADMIN', 'VOLUNTEER', 'USER', 'PUBLIC_USER']);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    initialize,
    setLoading,
    clearAuth,
    hasRole,
    isAdmin,
    isVolunteer,
    isUser,
  };
}; 