import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let border = "border-emerald-500 bg-white";
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />;

        if (toast.type === "error") {
          border = "border-rose-500 bg-white";
          icon = <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
        } else if (toast.type === "warning") {
          border = "border-amber-500 bg-white";
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />;
        } else if (toast.type === "info") {
          border = "border-blue-500 bg-white";
          icon = <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-elevated transition-all transform translate-y-0 ${border}`}
          >
            {icon}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-800">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
