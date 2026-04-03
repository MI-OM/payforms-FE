import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleGoBack = () => {
    this.setState({ hasError: false, error: null })
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6">
              We encountered an unexpected error. This has been logged and we'll look into it.
            </p>
            {this.state.error && (
              <details className="text-left mb-6 p-3 bg-gray-50 rounded-lg text-sm">
                <summary className="font-medium text-gray-700 cursor-pointer">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={this.handleGoBack}>
                Go Back
              </Button>
              <Button onClick={this.handleReload}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

interface AsyncErrorProps {
  children: ReactNode
  fallback?: ReactNode
}

interface AsyncErrorState {
  hasError: boolean
  error: Error | null
}

export class AsyncErrorBoundary extends Component<AsyncErrorProps, AsyncErrorState> {
  constructor(props: AsyncErrorProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): AsyncErrorState {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load data
          </h3>
          <p className="text-gray-500 mb-4">
            {this.state.error?.message || 'An error occurred while loading.'}
          </p>
          <Button variant="secondary" onClick={this.handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
