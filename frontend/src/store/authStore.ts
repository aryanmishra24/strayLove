import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, LoginDto, RegisterDto } from '../types/auth';
import authService from '../services/authService';
import toast from 'react-hot-toast';

interface AuthStore extends AuthState {
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      clearAuth: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      login: async (credentials: LoginDto) => {
        try {
          set({ isLoading: true });
          
          const response = await authService.login(credentials);
          
          const newState = {
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          };
          set(newState);
          
          toast.success('Login successful!');
        } catch (error) {
          console.error('[authStore] Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData: RegisterDto) => {
        try {
          set({ isLoading: true });
          const response = await authService.register(userData);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          toast.success('Registration successful!');
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          toast.success('Logged out successfully');
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          toast.success('Logged out successfully');
        }
      },

      initialize: async () => {
        // Set a timeout to ensure we don't hang indefinitely
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Initialize timeout')), 10000); // 10 second timeout
        });
        
        try {
          const initializePromise = (async () => {
            const currentState = get();
            const token = currentState.token;
            const user = currentState.user;
            
            if (token && user) {
              try {
                // Verify token is still valid by fetching current user
                const currentUser = await authService.getCurrentUser();
                set({
                  user: currentUser,
                  token,
                  isAuthenticated: true,
                  isLoading: false,
                });
              } catch (error) {
                // Token is invalid, clear everything
                console.warn('[authStore] Token invalid during initialize, logging out.');
                set({
                  user: null,
                  token: null,
                  isAuthenticated: false,
                  isLoading: false,
                });
              }
            } else {
              set({ isLoading: false });
            }
          })();
          
          await Promise.race([initializePromise, timeoutPromise]);
        } catch (error) {
          console.error('[authStore] Error during initialize:', error);
          // Always set loading to false even if there's an error
          set({ isLoading: false });
        }
        
        // Final check to ensure isLoading is false
        const finalState = get();
        if (finalState.isLoading) {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Check what's actually in localStorage
        const storedData = localStorage.getItem('auth-storage');
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            // Validate the parsed data
            if (parsed.state && typeof parsed.state === 'object') {
              // Data looks valid
            } else {
              console.warn('[authStore] Invalid localStorage data structure');
            }
          } catch (error) {
            console.warn('[authStore] Failed to parse localStorage data:', error);
          }
        }
      },
    }
  )
); 