'use client'

import React, { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2">出错了</h2>
            <p className="text-muted-foreground mb-6">
              抱歉，应用程序遇到了一个错误。请尝试刷新页面。
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-left bg-muted p-4 rounded-lg mb-6 overflow-auto max-h-48">
                <p className="font-mono text-sm text-red-500">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <p className="font-mono text-xs text-muted-foreground mt-2">
                    {this.state.errorInfo.componentStack}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                重试
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-input rounded-lg hover:bg-accent transition-colors"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
