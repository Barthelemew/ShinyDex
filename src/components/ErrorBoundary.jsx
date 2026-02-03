import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-twilight-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/50">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
            Oups ! Une erreur est survenue
          </h1>
          <p className="text-twilight-400 text-sm font-bold mb-8 max-w-md">
            L&apos;application a rencontré un problème inattendu. Pas d&apos;inquiétude, vos données sont en sécurité.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gold-champagne text-twilight-950 rounded-xl font-black uppercase italic tracking-tighter hover:scale-105 transition-all"
          >
            Recharger l&apos;application
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-8 p-4 bg-twilight-900 border border-twilight-800 rounded-xl text-red-400 text-xs text-left overflow-auto max-w-full">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
