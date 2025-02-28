import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Uncaught error in component tree:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
          <div className="bg-red-800 rounded-lg p-6 max-w-lg">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-6">The application encountered an unexpected error.</p>
            
            {this.state.error && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Error Details</h2>
                <p className="bg-red-900 p-3 rounded">{this.state.error.message}</p>
              </div>
            )}
            
            <button
              className="bg-white text-red-800 px-4 py-2 rounded hover:bg-gray-200"
              onClick={() => window.location.reload()}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add default export to fix the import error
export default ErrorBoundary;
