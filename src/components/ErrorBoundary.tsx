import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  props!: Props;

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center p-6">
          <div className="bg-white/20 backdrop-blur-xl rounded-[2rem] p-8 max-w-md w-full border border-white/25 shadow-2xl text-center space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/30 flex items-center justify-center border border-red-400/30">
              <AlertTriangle className="w-8 h-8 text-red-200" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">Terjadi Kesalahan</h2>
              <p className="text-sm text-white/75 leading-relaxed">
                Aplikasi mengalami kesalahan yang tidak terduga. Silakan muat ulang halaman.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-xs text-left text-white/60 bg-black/30 p-3 rounded-xl overflow-auto max-h-32 border border-white/10">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 rounded-2xl text-sm font-bold shadow-lg hover:bg-white/90 active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}