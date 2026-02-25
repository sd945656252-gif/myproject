'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ErrorContextType = {
  error: Error | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
  showError: (message: string) => void;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setErrorState] = useState<Error | null>(null);

  const setError = useCallback((error: Error | null) => {
    setErrorState(error);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorState(new Error(message));
  }, []);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError, showError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

export default ErrorProvider;
