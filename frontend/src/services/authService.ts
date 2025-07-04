import apiClient from './apiClient';
import type { LoginDto, RegisterDto, AuthResponse, User } from '../types/auth';
import { useAuthStore } from '../store/authStore';

interface BackendAuthResponse {
  code: number;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    tokenType: string;
    user: User;
  };
  timestamp: number;
}

class AuthService {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<BackendAuthResponse>('/auth/login', credentials);
      
      const authResponse = {
        user: response.data.data?.user,
        token: response.data.data?.token
      };
      return authResponse;
    } catch (error) {
      console.error('[authService] Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<BackendAuthResponse>('/auth/register', userData);
    return {
      user: response.data.data?.user,
      token: response.data.data?.token
    };
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error: any) {
      // Log the error but don't throw it since we want to clear store anyway
      console.warn('Logout request failed:', error.response?.data || error.message);
    } finally {
      // Always clear Zustand store regardless of server response
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: User }>('/auth/me');
    // The backend returns {code, message, data, timestamp}, so we need to extract data.data
    return response.data.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<BackendAuthResponse>('/auth/refresh');
    return {
      user: response.data.data?.user,
      token: response.data.data?.token
    };
  }

  // Helper methods for token management
  getToken(): string | null {
    const token = useAuthStore.getState().token;
    return token;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Promote user (admin only)
  async promoteUser({ email, username, role }: { email?: string; username?: string; role: string }): Promise<string> {
    const response = await apiClient.put('/auth/promote', { email, username, role });
    return response.data; // The apiClient already extracts the data property
  }

  // Get user info (admin only)
  async getUserInfo({ email, username }: { email?: string; username?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (username) params.append('username', username);
    const response = await apiClient.get(`/auth/user?${params.toString()}`);
    return response.data; // The apiClient already extracts the data property
  }
}

export const authService = new AuthService();
export default authService; 