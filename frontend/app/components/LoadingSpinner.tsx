import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-purple-600 border-t-transparent ${sizeClasses[size]} ${className}`} />
  );
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
      </div>
    </div>
  );
}

export function ButtonLoading() {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="sm" />
      <span>处理中...</span>
    </div>
  );
}
