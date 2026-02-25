'use client';

import { useError } from './providers/ErrorProvider';
import { XCircle, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function ErrorDisplay() {
  const { error, clearError } = useError();

  useEffect(() => {
    if (error) {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!error) return null;

  const isError = error.name === 'Error' || error.name === 'ApiError';

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-right">
      <div
        className={`rounded-lg shadow-lg border p-4 ${
          isError
            ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
        }`}
      >
        <div className="flex items-start gap-3">
          {isError ? (
            <XCircle className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          ) : (
            <AlertCircle className="text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
          )}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold mb-1 ${isError ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
              {isError ? '错误' : '警告'}
            </h3>
            <p className={`text-sm ${isError ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
              {error.message}
            </p>
          </div>
          <button
            onClick={clearError}
            className={`flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 ${isError ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}
          >
            <XCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
