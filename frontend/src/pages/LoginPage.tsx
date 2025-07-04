import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginFormData } from '../types/auth';
import Button from '../components/common/Button';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  console.log('[LoginPage] Loading state:', isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('[LoginPage] Form submitted with data:', { email: data.email, password: '***' });
    console.log('[LoginPage] Form errors:', errors);
    console.log('[LoginPage] Form is valid:', Object.keys(errors).length === 0);
    
    try {
      console.log('[LoginPage] Calling login function...');
      await login(data.email, data.password);
      console.log('[LoginPage] Login function completed successfully');
    } catch (error) {
      console.error('[LoginPage] Login error:', error);
      // Error is handled by the auth store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                placeholder="Enter your email"
                className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 placeholder-gray-600 dark:placeholder-gray-400 ${
                  errors.email 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                placeholder="Enter your password"
                className={`mt-1 block w-full rounded-md text-gray-900 dark:text-gray-300 placeholder-gray-600 dark:placeholder-gray-400 ${
                  errors.password 
                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary'
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary hover:text-primary/80"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 