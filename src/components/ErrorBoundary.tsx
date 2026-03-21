import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

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
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong. Please try again later.";
      
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.error.includes('insufficient permissions')) {
            errorMessage = "You don't have permission to perform this action. Please contact the administrator.";
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-dark-bg">
          <div className="glass p-12 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Oops! <span className="neon-text">Error</span></h2>
            <p className="text-white/60 mb-8">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="neon-btn w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <RefreshCcw size={20} /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
