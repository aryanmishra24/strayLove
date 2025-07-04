import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          useAuthStore.setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
        } else if (error.response?.status === 403) {
          toast.error('Access denied. You do not have permission for this action.');
        } else if (error.response?.status && error.response.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
          toast.error((error.response.data as { message: string }).message);
        } else {
          toast.error('An unexpected error occurred.');
        }
        return Promise.reject(error);
      }
    );
  }

  public get instance(): AxiosInstance {
    return this.api;
  }

  public async get<T>(url: string, config = {}): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data = {}, config = {}): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data = {}, config = {}): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config = {}): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  public async patch<T>(url: string, data = {}, config = {}): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 