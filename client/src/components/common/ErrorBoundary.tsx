import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

interface Props {
  children: ReactNode;
  tabName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 animate-fadeIn">
          <div className="cred-card max-w-lg w-full p-8 rounded-3xl border border-rose-500/30 bg-[#0f111a] text-center shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(255,45,120,0.15)]">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              Module Encountered an Issue
            </h3>

            <p className="text-xs text-zinc-400 mt-2 font-medium leading-relaxed">
              {this.props.tabName
                ? `An unexpected render state occurred in the "${this.props.tabName}" module.`
                : "An unexpected error occurred while rendering this view."}
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 rounded-xl bg-black/60 border border-white/5 text-left font-mono text-[11px] text-rose-300/90 break-words max-h-32 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={this.handleReset}
                className="cred-btn-primary py-2.5 px-5 text-xs flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload View</span>
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = "";
                  if (this.props.onReset) this.props.onReset();
                }}
                className="cred-btn-secondary py-2.5 px-5 text-xs flex items-center gap-2"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

